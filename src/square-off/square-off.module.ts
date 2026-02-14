import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SquareOff } from './entities/square-off.entity';
import { SquareOffPosition } from './entities/square-off-position.entity';
import { Position } from '../positions/entities/position.entity';
import { Order } from '../orders/entities/order.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { SquareOffService } from './square-off.service';
import { SquareOffController } from './square-off.controller';
import { FirebaseAuthModule } from '../firebase_auth/firebase_auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SquareOff,
      SquareOffPosition,
      Position,
      Order,
      Wallet,
      User,
    ]),
    ScheduleModule.forRoot(),
    FirebaseAuthModule,
  ],
  controllers: [SquareOffController],
  providers: [SquareOffService],
  exports: [SquareOffService],
})
export class SquareOffModule {}
