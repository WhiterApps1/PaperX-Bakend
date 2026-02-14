import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Position } from './entities/position.entity';
import { ListPositionsDto } from './dto/list-positions.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) {}

  /* ----------------------------------------
     List Positions (Current User)
  ---------------------------------------- */
  async listPositions(userEmail: string, query: ListPositionsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.positionRepo
      .createQueryBuilder('position')
      .leftJoin('position.user', 'user')
      .where('user.email = :email', { email: userEmail })
      .orderBy('position.openedAt', 'DESC')
      .skip(skip)
      .take(limit);

    /* -------- Optional Filters -------- */

    if (query.symbol) {
      qb.andWhere('position.symbol = :symbol', {
        symbol: query.symbol,
      });
    }

    // Future use (status column)
    // if (query.status) {
    //   qb.andWhere('position.status = :status', {
    //     status: query.status,
    //   });
    // }

    const [positions, total] = await qb.getManyAndCount();

    return {
      data: positions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /* ----------------------------------------
     Get One Position (Ownership Enforced)
  ---------------------------------------- */
  async getPosition(positionId: string, userEmail: string) {
    const position = await this.positionRepo
      .createQueryBuilder('position')
      .leftJoinAndSelect('position.user', 'user')
      .where('position.id = :id', { id: positionId })
      .andWhere('user.email = :email', {
        email: userEmail,
      })
      .getOne();

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return position;
  }

  /* ----------------------------------------
     Position Risk Metrics (Secured)
  ---------------------------------------- */
  async getPositionRiskMetrics(positionId: string, userEmail: string) {
    const position = await this.positionRepo
      .createQueryBuilder('position')
      .leftJoin('position.user', 'user')
      .where('position.id = :id', { id: positionId })
      .andWhere('user.email = :email', {
        email: userEmail,
      })
      .getOne();

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    /* -------- Risk Calculations -------- */

    const notional = position.quantity * Number(position.entryPrice);

    // Example: 20% margin
    const marginRequired = (notional * 20) / 100;

    // Example: Liquidation at -20%
    const liquidationPrice = Number(position.entryPrice) * 0.8;

    return {
      positionId: position.id,
      symbol: position.symbol,
      quantity: position.quantity,
      entryPrice: Number(position.entryPrice),

      notional,
      marginRequired,
      liquidationPrice,

      // Placeholder (should come from market feed)
      currentPrice: Number(position.entryPrice),
    };
  }
}
