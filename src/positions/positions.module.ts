import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Order } from '../orders/entities/order.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TradeAudit } from '../orders/entities/trade-audit.entity';
import { User } from '../user/entities/user.entity';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { FirebaseAuthModule } from '../firebase_auth/firebase_auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position, Order, Wallet, TradeAudit, User]),
    FirebaseAuthModule,
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
