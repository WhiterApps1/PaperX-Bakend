import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../positions/entities/position.entity';
import { Order } from '../orders/entities/order.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  /* ----------------------------------------
     Portfolio Summary
  ---------------------------------------- */
  async getPortfolioSummary(userEmail: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { email: userEmail } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const positions = await this.positionRepo.find({
      where: { user: { email: userEmail } },
    });

    const totalMarginUsed = positions.reduce(
      (sum, pos) => sum + Number(pos.marginUsed),
      0,
    );

    const totalEquity = Number(wallet.balance);
    const availableBalance = totalEquity - totalMarginUsed;

    const marginUtilizationPercentage =
      totalEquity > 0 ? (totalMarginUsed / totalEquity) * 100 : 0;

    return {
      totalEquity,
      availableBalance,
      totalMarginUsed,
      marginUtilizationPercentage,
      openPositions: positions.length,
    };
  }

  /* ----------------------------------------
     Balance
  ---------------------------------------- */
  async getBalance(userEmail: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { email: userEmail } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const positions = await this.positionRepo.find({
      where: { user: { email: userEmail } },
    });

    const lockedMargin = positions.reduce(
      (sum, pos) => sum + Number(pos.marginUsed),
      0,
    );

    return {
      totalBalance: Number(wallet.balance),
      lockedMargin,
      availableBalance: Number(wallet.balance) - lockedMargin,
    };
  }

  /* ----------------------------------------
     Holdings
  ---------------------------------------- */
  async getHoldings(userEmail: string) {
    const positions = await this.positionRepo.find({
      where: { user: { email: userEmail } },
      relations: ['order'],
    });

    return positions.map((pos) => ({
      positionId: pos.id,
      symbol: pos.symbol,
      quantity: pos.quantity,
      entryPrice: Number(pos.entryPrice),
      notionalValue: pos.quantity * Number(pos.entryPrice),
      marginRequired: Number(pos.marginUsed),
    }));
  }

  /* ----------------------------------------
     Order History (Paginated)
  ---------------------------------------- */
  async getHistory(userEmail: string, pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.email = :email', { email: userEmail })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* ----------------------------------------
     Performance
  ---------------------------------------- */
  async getPerformance(userEmail: string) {
    const orders = await this.orderRepo.find({
      where: { user: { email: userEmail } },
    });

    if (!orders.length) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
      };
    }

    // Placeholder until P&L is implemented
    return {
      totalTrades: orders.length,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
    };
  }

  /* ----------------------------------------
     Risk Analysis
  ---------------------------------------- */
  async getPortfolioRisk(userEmail: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { email: userEmail } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const positions = await this.positionRepo.find({
      where: { user: { email: userEmail } },
    });

    const totalMarginRequired = positions.reduce(
      (sum, pos) => sum + Number(pos.marginUsed),
      0,
    );

    const totalEquity = Number(wallet.balance);

    const utilizationPercentage =
      totalEquity > 0 ? (totalMarginRequired / totalEquity) * 100 : 0;

    return {
      totalEquity,
      totalMarginRequired,
      availableMargin: totalEquity - totalMarginRequired,
      utilizationPercentage,
      positions: positions.length,
      isHealthy: utilizationPercentage < 80,
      liquidationRisk: utilizationPercentage > 80 ? 'HIGH' : 'LOW',
    };
  }
}
