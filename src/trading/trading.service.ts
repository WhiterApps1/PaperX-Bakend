import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Position } from './entities/position.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
import { User } from 'src/user/entities/user.entity';
import { AdminPlaceOrderDto } from './dto/admin-place-order.dto';
import { AuditType, TradeAudit } from './entities/trade-audit.entity';

@Injectable()
export class TradingService {
  constructor(private readonly dataSource: DataSource) {}

  async placeOrder(email: string, dto: PlaceOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      /* ---------------- Find User ---------------- */

      const user = await manager.findOne(User, {
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const userId = user.id;

      /* ---------------- Lock Wallet ---------------- */

      const wallet = await manager.findOne(Wallet, {
        where: { userId: userId.toString() },
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
        userId,
        symbol: dto.symbol,
        side: dto.side,
        price: dto.price,
        quantity: dto.quantity,
        marginUsed: requiredMargin,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await manager.save(order);

      /* ---------------- Create Position ---------------- */

      const position = manager.create(Position, {
        userId,
        symbol: dto.symbol,
        quantity: dto.quantity,
        entryPrice: dto.price,
        marginUsed: requiredMargin,
      });

      await manager.save(position);

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

      const userId = user.id;

      const position = await manager.findOne(Position, {
        where: { id: positionId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      const wallet = await manager.findOne(Wallet, {
        where: { userId: userId.toString() },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      wallet.locked = Number(wallet.locked) - Number(position.marginUsed);

      await manager.save(wallet);

      await manager.remove(position);

      return { status: 'closed' };
    });
  }

  async adminPlaceOrder(adminEmail: string, dto: AdminPlaceOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      /* ---------------- Find Admin ---------------- */

      const admin = await manager.findOne(User, {
        where: { email: adminEmail },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      /* ---------------- Validate Client ---------------- */

      const client = await manager.findOne(User, {
        where: { id: dto.clientId },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      if (client.parent?.id !== admin.id) {
        throw new ForbiddenException(
          'You are not authorized to trade for this client',
        );
      }

      /* ---------------- Execute Trade ---------------- */

      const order = await this.placeOrderInternal(
        manager,
        client.id,
        dto,
        admin.id,
      );

      /* ---------------- Audit Log ---------------- */

      const audit = manager.create(TradeAudit, {
        orderId: order.id,
        clientId: client.id.toString(),
        initiatedBy: admin.id.toString(),
        type: AuditType.ADMIN,
      });

      await manager.save(audit);

      return order;
    });
  }

  private async placeOrderInternal(
    manager: EntityManager,
    userId: string,
    dto: PlaceOrderDto,
    initiatedBy?: string,
  ) {
    const wallet = await manager.findOne(Wallet, {
      where: { userId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const requiredMargin = dto.price * dto.quantity * dto.exposure;

    const available = Number(wallet.balance) - Number(wallet.locked);

    if (available < requiredMargin) {
      throw new BadRequestException('Insufficient margin');
    }

    wallet.locked = Number(wallet.locked) + requiredMargin;

    await manager.save(wallet);

    const order = manager.create(Order, {
      userId,
      symbol: dto.symbol,
      side: dto.side,
      price: dto.price,
      quantity: dto.quantity,
      marginUsed: requiredMargin,
      status: OrderStatus.OPEN,
      initiatedBy: initiatedBy ?? null,
    });

    const savedOrder = await manager.save(order);

    const position = manager.create(Position, {
      userId,
      symbol: dto.symbol,
      quantity: dto.quantity,
      entryPrice: dto.price,
      marginUsed: requiredMargin,
    });

    await manager.save(position);

    return savedOrder;
  }
}
