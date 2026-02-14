import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from '../positions/entities/position.entity';
import { Order } from '../orders/entities/order.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { TradeAudit } from '../orders/entities/trade-audit.entity';
import { User } from '../user/entities/user.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { FirebaseAuthModule } from '../firebase_auth/firebase_auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position, Order, Wallet, TradeAudit, User]),
    FirebaseAuthModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
