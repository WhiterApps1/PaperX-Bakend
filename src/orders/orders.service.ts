import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Position } from '../positions/entities/position.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TradeAudit, AuditType } from './entities/trade-audit.entity';
import { User } from '../user/entities/user.entity';
import { ROLE_RANK, Roles } from '../firebase_auth/roles';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(TradeAudit)
    private readonly auditRepo: Repository<TradeAudit>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private isAtLeastAdmin(user: User): boolean {
    if (!user.profile?.roles?.length) return false;
    return user.profile.roles.some(
      (role) => ROLE_RANK[role] >= ROLE_RANK[Roles.ADMIN],
    );
  }

  async createOrder(email: string, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const requester = await manager.findOne(User, {
        where: { email },
        relations: ['parent', 'profile'],
      });

      if (!requester) throw new BadRequestException('User not found');

      let client: User | null;
      let initiatedBy: User | null = null;
      let auditType: AuditType = AuditType.CLIENT;

      if (dto.clientId) {
        if (!this.isAtLeastAdmin(requester)) {
          throw new ForbiddenException(
            'Only admins can place orders for clients',
          );
        }

        client = await manager.findOne(User, {
          where: { id: dto.clientId },
          relations: ['parent'],
        });

        if (!client) throw new NotFoundException('Client not found');

        if (client.parent?.id !== requester.id) {
          throw new ForbiddenException('Not authorized for this client');
        }

        initiatedBy = requester;
        auditType = AuditType.ADMIN;
      } else {
        client = requester;
        initiatedBy = requester;
      }

      // Lock wallet for update
      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: client.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      // Calculate 20% margin requirement
      const notional = dto.price * dto.quantity;
      const requiredMargin = (notional * 20) / 100;
      const available = Number(wallet.balance) - Number(wallet.locked);

      if (available < requiredMargin) {
        throw new BadRequestException('Insufficient margin');
      }

      // Lock margin
      wallet.locked = Number(wallet.locked) + requiredMargin;
      await manager.save(wallet);

      // Create order
      const order = manager.create(Order, {
        user: client,
        symbol: dto.symbol,
        orderType: dto.orderType,
        price: dto.price,
        quantity: dto.quantity,
        marginUsed: requiredMargin,
        status: OrderStatus.CLOSED,
        initiatedBy,
      });

      const savedOrder = await manager.save(order);

      // Create position
      const position = manager.create(Position, {
        user: client,
        symbol: dto.symbol,
        quantity: dto.quantity,
        entryPrice: dto.price,
        marginUsed: requiredMargin,
      });

      await manager.save(position);

      // Audit
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

  async listOrders(email: string, query: ListOrdersDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { email },
        relations: ['parent', 'profile'],
      });

      if (!user) throw new BadRequestException('User not found');

      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const qb = manager
        .createQueryBuilder(Order, 'order')
        .orderBy('order.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      // User can only see own orders
      qb.where('order.userId = :userId', { userId: user.id });

      if (query.status) {
        qb.andWhere('order.status = :status', { status: query.status });
      }

      if (query.symbol) {
        qb.andWhere('order.symbol = :symbol', { symbol: query.symbol });
      }

      const [orders, total] = await qb.getManyAndCount();

      return {
        data: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getOrder(orderId: string, email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new NotFoundException('User not found');

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'initiatedBy'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.user.id !== user.id) {
      throw new ForbiddenException('Cannot access this order');
    }

    return order;
  }

  async cancelOrder(orderId: string, email: string) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { email } });

      if (!user) throw new NotFoundException('User not found');

      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.user.id !== user.id) {
        throw new ForbiddenException('Cannot cancel this order');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order already cancelled');
      }

      const wallet = await manager.findOne(Wallet, {
        where: { user: { id: user.id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      // Release margin
      wallet.locked = Number(wallet.locked) - Number(order.marginUsed);
      if (wallet.locked < 0) wallet.locked = 0;

      await manager.save(wallet);

      order.status = OrderStatus.CANCELLED;
      const updated = await manager.save(order);

      // Audit
      const audit = manager.create(TradeAudit, {
        order: updated,
        client: user,
        type: AuditType.CLIENT,
      });

      await manager.save(audit);

      return updated;
    });
  }
}
