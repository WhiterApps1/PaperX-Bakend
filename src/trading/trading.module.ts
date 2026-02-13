import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Order } from './entities/order.entity';
import { Position } from './entities/position.entity';
import { FirebaseAuthModule } from 'src/firebase_auth/firebase_auth.module';
import { TradeAudit } from './entities/trade-audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Order, Position, TradeAudit]),
    FirebaseAuthModule,
  ],
  providers: [TradingService],
  controllers: [TradingController],
})
export class TradingModule {}
