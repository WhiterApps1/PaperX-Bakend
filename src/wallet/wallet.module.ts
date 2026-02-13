import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreditTransaction } from './entities/credit-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, CreditTransaction])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
