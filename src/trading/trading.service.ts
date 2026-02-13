import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Position } from './entities/position.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/entities/user.entity';
import { AuditType, TradeAudit } from './entities/trade-audit.entity';
import { ROLE_RANK, Roles } from 'src/firebase_auth/roles';

@Injectable()
export class TradingService {
  constructor(private readonly dataSource: DataSource) {}

  private isAtLeastAdmin(user: User): boolean {
    if (!user.profile?.roles?.length) return false;

    return user.profile.roles.some(
      (role) => ROLE_RANK[role] >= ROLE_RANK[Roles.ADMIN],
    );
  }

  async createOrder(email: string, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      // Find Requester
      const requester = await manager.findOne(User, {
        where: { email },
        relations: ['parent', 'profile'],
      });

      if (!requester) {
        throw new BadRequestException('User not found');
      }

      let client: User | null;
      let initiatedBy: User | null = null;
      let auditType: AuditType;

      /* ---------------- Check Admin Mode ---------------- */

      if (dto.clientId) {
        /* ---- Admin placing for client ---- */

        if (!this.isAtLeastAdmin(requester)) {
          throw new ForbiddenException(
            'Only admins can place orders for clients',
          );
        }

        client = await manager.findOne(User, {
          where: { id: dto.clientId },
          relations: ['parent'],
        });

        if (!client) {
          throw new NotFoundException('Client not found');
        }

        // Parent-child validation
        if (client.parent?.id !== requester.id) {
          throw new ForbiddenException(
            'You are not authorized to trade for this client',
          );
        }

        initiatedBy = requester;
        auditType = AuditType.ADMIN;
      } else {
        /* ---- Normal user placing ---- */

        client = requester;
        initiatedBy = requester;
        auditType = AuditType.CLIENT;
      }

      /* ---------------- Lock Wallet ---------------- */

      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: client.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      /* ---------------- Calculate Margin ---------------- */

      const requiredMargin = dto.price * dto.quantity * dto.exposure;

      const available = Number(wallet.balance) - Number(wallet.locked);

      if (available < requiredMargin) {
        throw new BadRequestException('Insufficient margin');
      }

      /* ---------------- Lock Margin ---------------- */

      wallet.locked = Number(wallet.locked) + requiredMargin;

      await manager.save(wallet);

      /* ---------------- Create Order ---------------- */

      const order = manager.create(Order, {
        user: client,
        symbol: dto.symbol,
        side: dto.side,
        price: dto.price,
        quantity: dto.quantity,
        marginUsed: requiredMargin,
        status: OrderStatus.OPEN,
        initiatedBy,
      });

      const savedOrder = await manager.save(order);

      /* ---------------- Create / Update Position ---------------- */

      const position = manager.create(Position, {
        user: client,
        symbol: dto.symbol,
        quantity: dto.quantity,
        entryPrice: dto.price,
        marginUsed: requiredMargin,
      });

      await manager.save(position);

      /* ---------------- Audit Log ---------------- */

      const audit = manager.create(TradeAudit, {
        order: savedOrder,
        client,
        initiatedBy,
        type: auditType,
      });

      await manager.save(audit);

      return savedOrder;
    });
  }

  async closePosition(positionId: string, email: string) {
    return this.dataSource.transaction(async (manager) => {
      /* ---------------- Find User ---------------- */

      const user = await manager.findOne(User, {
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      /* ---------------- Lock Position ---------------- */

      const position = await manager.findOne(Position, {
        where: {
          id: positionId,
          user: { id: user.id },
        },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      /* ---------------- Lock Wallet ---------------- */

      const wallet = await manager.findOne(Wallet, {
        where: {
          user: { id: user.id },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      /* ---------------- Release Margin ---------------- */

      wallet.locked = Number(wallet.locked) - Number(position.marginUsed);

      // Safety: never go negative
      if (wallet.locked < 0) {
        wallet.locked = 0;
      }

      await manager.save(wallet);

      /* ---------------- Remove Position ---------------- */

      await manager.remove(position);

      return { status: 'closed' };
    });
  }
}
