import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { Position } from '../positions/entities/position.entity';
import {
  SquareOff,
  SquareOffTrigger,
  SquareOffStatus,
} from './entities/square-off.entity';
import {
  SquareOffPosition,
  SquareOffPositionStatus,
} from './entities/square-off-position.entity';
import { ManualSquareOffDto } from './dto/manual-square-off.dto';
import { ROLE_RANK, Roles } from '../firebase_auth/roles';

@Injectable()
export class SquareOffService {
  private readonly logger = new Logger(SquareOffService.name);

  // Configuration (can be moved to env vars or database)
  private readonly DEFAULT_SQUARE_OFF_THRESHOLD = 500; // In currency units
  private readonly DEFAULT_MARGIN_CALL_THRESHOLD = 1000;
  private readonly DEFAULT_CHECK_INTERVAL = 60; // seconds
  private readonly DEFAULT_MAX_MARGIN_UTILIZATION = 80; // percentage

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SquareOff)
    private readonly squareOffRepo: Repository<SquareOff>,
    @InjectRepository(SquareOffPosition)
    private readonly squareOffPositionRepo: Repository<SquareOffPosition>,
  ) {}

  private isAtLeastAdmin(user: User): boolean {
    if (!user.profile?.roles?.length) return false;
    return user.profile.roles.some(
      (role) => ROLE_RANK[role] >= ROLE_RANK[Roles.ADMIN],
    );
  }

  /**
   * Main scheduled task that monitors all clients for square-off conditions
   * Runs every 60 seconds by default
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async executeAutoSquareOffCheck() {
    this.logger.debug('[AUTO SQUARE-OFF] Starting scheduled check...');

    try {
      // Get all users with wallets
      const users = await this.dataSource.manager.find(User, {
        relations: ['wallet'],
      });

      for (const user of users) {
        try {
          await this.checkAndSquareOffIfNeeded(user.id, user.email);
        } catch (error) {
          this.logger.error(
            `[AUTO SQUARE-OFF] Error processing user ${user.id}:`,
            error,
          );
          // Continue with next user instead of failing entire batch
        }
      }

      this.logger.debug('[AUTO SQUARE-OFF] Scheduled check completed');
    } catch (error) {
      this.logger.error('[AUTO SQUARE-OFF] Fatal error during check:', error);
    }
  }

  /**
   * Check if a user needs to be squared off
   */
  async checkAndSquareOffIfNeeded(userId: string, email: string) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['wallet'],
      });

      if (!user || !user.wallet) {
        return { skipped: true, reason: 'User or wallet not found' };
      }

      const balance = Number(user.wallet.balance);
      const locked = Number(user.wallet.locked);

      // Check if balance is below threshold
      if (balance < this.DEFAULT_SQUARE_OFF_THRESHOLD) {
        this.logger.warn(
          `[AUTO SQUARE-OFF] User ${userId} balance ${balance} below threshold ${this.DEFAULT_SQUARE_OFF_THRESHOLD}`,
        );

        const result = await this.performSquareOff(
          userId,
          email,
          SquareOffTrigger.AUTO,
          null,
          `Auto square-off: Balance ${balance} below threshold ${this.DEFAULT_SQUARE_OFF_THRESHOLD}`,
          manager,
        );

        return result;
      }

      // Check if margin utilization exceeds threshold
      const totalEquity = balance + locked;
      const marginUtilization =
        totalEquity > 0 ? (locked / totalEquity) * 100 : 0;

      if (marginUtilization > this.DEFAULT_MAX_MARGIN_UTILIZATION) {
        this.logger.warn(
          `[AUTO SQUARE-OFF] User ${userId} margin utilization ${marginUtilization.toFixed(2)}% exceeds threshold`,
        );

        const result = await this.performSquareOff(
          userId,
          email,
          SquareOffTrigger.MARGIN_CALL,
          this.DEFAULT_MARGIN_CALL_THRESHOLD,
          `Margin call: Utilization ${marginUtilization.toFixed(2)}% exceeds threshold ${this.DEFAULT_MAX_MARGIN_UTILIZATION}%`,
          manager,
        );

        return result;
      }

      return { skipped: true, reason: 'No trigger conditions met' };
    });
  }

  /**
   * Manual square-off initiated by admin
   */
  async manualSquareOff(email: string, dto: ManualSquareOffDto) {
    return this.dataSource.transaction(async (manager) => {
      // Verify admin rights
      const admin = await manager.findOne(User, {
        where: { email },
        relations: ['profile', 'parent'],
      });

      if (!admin) throw new NotFoundException('Admin not found');
      if (!this.isAtLeastAdmin(admin))
        throw new ForbiddenException('Only admins can perform square-off');

      // Verify client exists and belongs to admin
      const client = await manager.findOne(User, {
        where: { id: dto.clientId },
        relations: ['parent'],
      });

      if (!client) throw new NotFoundException('Client not found');
      if (client.parent?.id !== admin.id)
        throw new ForbiddenException('Client does not belong to this admin');

      // Check if already in progress
      const existingSquareOff = await manager.findOne(SquareOff, {
        where: {
          client: { id: client.id },
          status: SquareOffStatus.IN_PROGRESS,
        },
      });

      if (existingSquareOff) {
        throw new BadRequestException(
          'Square-off already in progress for this client',
        );
      }

      return this.performSquareOff(
        client.id,
        client.email,
        SquareOffTrigger.ADMIN,
        null,
        dto.reason || 'Manual square-off by admin',
        manager,
        admin.id,
      );
    });
  }

  /**
   * Core square-off logic that closes all open positions
   */
  private async performSquareOff(
    clientId: string,
    clientEmail: string,
    trigger: SquareOffTrigger,
    thresholdLimit: number | null,
    reason: string,
    manager: any,
    initiatedById?: string,
  ) {
    this.logger.log(
      `[SQUARE-OFF] Starting ${trigger} square-off for client ${clientId}. Reason: ${reason}`,
    );

    try {
      // Lock wallet and fetch all data
      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: clientId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const positions = await manager.find(Position, {
        where: { user: { id: clientId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (positions.length === 0) {
        this.logger.log(`[SQUARE-OFF] No positions to close for ${clientId}`);
        return {
          status: 'success',
          message: 'No open positions to square off',
          positionsClosed: 0,
        };
      }

      // Create square-off record
      const squareOff = manager.create(SquareOff, {
        client: { id: clientId },
        trigger,
        status: SquareOffStatus.IN_PROGRESS,
        balanceAtTrigger: Number(wallet.balance),
        thresholdLimit,
        totalPositions: positions.length,
        reason,
        triggeredBy: initiatedById ? { id: initiatedById } : null,
      });

      const savedSquareOff = await manager.save(squareOff);

      // Process each position
      let totalMarginReleased = 0;
      let closedCount = 0;
      let failedCount = 0;
      const failureDetails: string[] = [];

      for (const position of positions) {
        try {
          // Simulate market price close (in production, fetch from price service)
          const exitPrice = this.getMarketPrice(position.symbol);

          // Create square-off position record
          const squareOffPos = manager.create(SquareOffPosition, {
            squareOff: savedSquareOff,
            position,
            symbol: position.symbol,
            quantity: position.quantity,
            entryPrice: Number(position.entryPrice),
            exitPrice: Number(exitPrice),
            status: SquareOffPositionStatus.CLOSED,
            marginReleased: Number(position.marginUsed),
            remarks: `Closed at market price ${exitPrice}`,
          });

          await manager.save(squareOffPos);

          // Delete the position
          await manager.remove(position);

          // Release margin
          totalMarginReleased += Number(position.marginUsed);
          closedCount++;

          this.logger.log(
            `[SQUARE-OFF] Position ${position.id} (${position.symbol}) closed at ${exitPrice}`,
          );
        } catch (error) {
          failedCount++;
          const errorMsg = `Failed to close ${position.symbol}: ${error.message}`;
          failureDetails.push(errorMsg);
          this.logger.error(`[SQUARE-OFF] ${errorMsg}`);

          // Still create record but mark as failed
          const squareOffPos = manager.create(SquareOffPosition, {
            squareOff: savedSquareOff,
            position,
            symbol: position.symbol,
            quantity: position.quantity,
            entryPrice: Number(position.entryPrice),
            status: SquareOffPositionStatus.FAILED,
            remarks: error.message,
          });

          await manager.save(squareOffPos);
        }
      }

      // Update wallet with released margin
      wallet.locked = Math.max(0, Number(wallet.locked) - totalMarginReleased);
      await manager.save(wallet);

      // Update square-off record with final status
      const finalStatus =
        failedCount === 0
          ? SquareOffStatus.COMPLETED
          : closedCount === 0
            ? SquareOffStatus.FAILED
            : SquareOffStatus.PARTIAL;

      savedSquareOff.status = finalStatus;
      savedSquareOff.closedPositions = closedCount;
      savedSquareOff.failedPositions = failedCount;
      savedSquareOff.totalMarginReleased = totalMarginReleased;
      savedSquareOff.completedAt = new Date();
      if (failureDetails.length > 0) {
        savedSquareOff.failureDetails = failureDetails.join('; ');
      }

      await manager.save(savedSquareOff);

      this.logger.log(
        `[SQUARE-OFF] Completed for client ${clientId}. Closed: ${closedCount}, Failed: ${failedCount}, Margin released: ${totalMarginReleased}`,
      );

      return {
        squareOffId: savedSquareOff.id,
        status: finalStatus,
        closedPositions: closedCount,
        failedPositions: failedCount,
        marginReleased: totalMarginReleased,
        newBalance: Number(wallet.balance),
        newLocked: Number(wallet.locked),
      };
    } catch (error) {
      this.logger.error(`[SQUARE-OFF] Fatal error: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Fetch current market price for a symbol
   * In production, integrate with your price service (websocket, API, etc.)
   */
  private getMarketPrice(symbol: string): number {
    // TODO: Integrate with real price service
    // For now, return a mock price
    this.logger.debug(`[PRICE] Fetching market price for ${symbol}`);

    // In production:
    // return await this.priceService.getCurrentPrice(symbol);
    // OR: return this.cachedPrices.get(symbol) || 0;

    return Math.random() * 50000 + 1000; // Mock implementation
  }

  /**
   * Get square-off history for a client
   */
  async getSquareOffHistory(email: string, clientId?: string, limit = 50) {
    return this.dataSource.transaction(async (manager) => {
      const requester = await manager.findOne(User, {
        where: { email },
        relations: ['profile', 'parent'],
      });

      if (!requester) throw new NotFoundException('User not found');

      let filterClientId = clientId;

      if (clientId) {
        if (!this.isAtLeastAdmin(requester))
          throw new ForbiddenException(
            'Only admins can view other client history',
          );

        const client = await manager.findOne(User, {
          where: { id: clientId },
          relations: ['parent'],
        });
        if (!client) throw new NotFoundException('Client not found');
        if (client.parent?.id !== requester.id)
          throw new ForbiddenException('Not authorized for this client');
      } else {
        filterClientId = requester.id;
      }

      const squareOffs = await manager.find(SquareOff, {
        where: { client: { id: filterClientId } },
        relations: ['client', 'triggeredBy'],
        take: limit,
        order: { initiatedAt: 'DESC' },
      });

      return {
        squareOffs,
        total: squareOffs.length,
      };
    });
  }

  /**
   * Get details of a specific square-off event
   */
  async getSquareOffDetails(email: string, squareOffId: string) {
    return this.dataSource.transaction(async (manager) => {
      const requester = await manager.findOne(User, {
        where: { email },
        relations: ['profile', 'parent'],
      });

      if (!requester) throw new NotFoundException('User not found');

      const squareOff = await manager.findOne(SquareOff, {
        where: { id: squareOffId },
        relations: ['client', 'triggeredBy'],
      });

      if (!squareOff)
        throw new NotFoundException('Square-off record not found');

      if (squareOff.client.id !== requester.id) {
        if (
          !this.isAtLeastAdmin(requester) ||
          squareOff.client.parent?.id !== requester.id
        ) {
          throw new ForbiddenException(
            'Not authorized to view this square-off record',
          );
        }
      }

      const positions = await manager.find(SquareOffPosition, {
        where: { squareOff: { id: squareOffId } },
      });

      return {
        squareOff,
        positions,
      };
    });
  }

  /**
   * Get current risk status for a client
   */
  async getRiskStatus(email: string, clientId?: string) {
    return this.dataSource.transaction(async (manager) => {
      const requester = await manager.findOne(User, {
        where: { email },
        relations: ['profile', 'parent'],
      });

      if (!requester) throw new NotFoundException('User not found');

      let filterClientId = clientId;

      if (clientId) {
        if (!this.isAtLeastAdmin(requester))
          throw new ForbiddenException(
            'Only admins can check other client risk',
          );

        const client = await manager.findOne(User, {
          where: { id: clientId },
          relations: ['parent'],
        });
        if (!client) throw new NotFoundException('Client not found');
        if (client.parent?.id !== requester.id)
          throw new ForbiddenException('Not authorized for this client');
      } else {
        filterClientId = requester.id;
      }

      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: filterClientId } },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const positions = await manager.find(Position, {
        where: { user: { id: filterClientId } },
      });

      const balance = Number(wallet.balance);
      const locked = Number(wallet.locked);
      const totalEquity = balance + locked;
      const marginUtilization =
        totalEquity > 0 ? (locked / totalEquity) * 100 : 0;

      const riskLevel =
        marginUtilization > this.DEFAULT_MAX_MARGIN_UTILIZATION
          ? 'CRITICAL'
          : marginUtilization > 60
            ? 'HIGH'
            : marginUtilization > 40
              ? 'MEDIUM'
              : 'LOW';

      const needsSquareOff =
        balance < this.DEFAULT_SQUARE_OFF_THRESHOLD ||
        marginUtilization > this.DEFAULT_MAX_MARGIN_UTILIZATION;

      return {
        balance,
        locked,
        totalEquity,
        marginUtilization: marginUtilization.toFixed(2),
        riskLevel,
        squareOffThreshold: this.DEFAULT_SQUARE_OFF_THRESHOLD,
        marginCallThreshold: this.DEFAULT_MARGIN_CALL_THRESHOLD,
        openPositions: positions.length,
        needsSquareOff,
        estimatedLiquidationPrice: this.calculateLiquidationPrice(
          positions,
          balance,
        ),
      };
    });
  }

  /**
   * Calculate liquidation price based on current positions
   */
  private calculateLiquidationPrice(positions: Position[], balance: number) {
    if (positions.length === 0) return null;

    // Simplified calculation: average entry price
    const avgEntryPrice =
      positions.reduce((sum, p) => sum + Number(p.entryPrice), 0) /
      positions.length;

    // Liquidation happens when balance reaches 0
    // This is a simplified calculation
    return avgEntryPrice * 0.8; // Assume 20% cushion
  }
}
