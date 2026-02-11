import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Position } from './entities/position.entity';
import { PlaceOrderDto } from './dto/place-order.dto';
import { User } from 'src/user/entities/user.entity';

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
        userId: userId.toString(),
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
        userId: userId.toString(),
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
        where: { id: positionId, userId: userId.toString() },
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
}
