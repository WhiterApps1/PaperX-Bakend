import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Position } from '../positions/entities/position.entity';
import { TradeAudit } from './entities/trade-audit.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { FirebaseAuthModule } from '../firebase_auth/firebase_auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Position, TradeAudit, Wallet, User]),
    FirebaseAuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
