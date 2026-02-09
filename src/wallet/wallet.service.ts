import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Wallet, CreditTransaction } from "./entities/wallet.entity";

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  async transferCredits(
    senderId: string, 
    receiverId: string, 
    amount: number, 
    type: 'PUSH' | 'RECLAIM'
  ) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return await this.dataSource.transaction(async (manager) => {
      // 1. Lock the sender's wallet to prevent concurrent over-spending
      const senderWallet = await manager.findOne(Wallet, {
        where: { userId: senderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!senderWallet || senderWallet.balance < amount) {
        throw new BadRequestException('Insufficient credit balance');
      }

      // 2. Find or create receiver wallet
      let receiverWallet = await manager.findOne(Wallet, { 
        where: { userId: receiverId },
        lock: { mode: 'pessimistic_write' } 
      });

      // 3. Perform the arithmetic
      senderWallet.balance = Number(senderWallet.balance) - amount;
      receiverWallet!.balance = Number(receiverWallet!.balance) + amount;

      // 4. Save updates and log transaction
      await manager.save(senderWallet);
      await manager.save(receiverWallet);
      
      const log = manager.create(CreditTransaction, {
        senderId,
        receiverId,
        amount,
        type,
      });
      
      return await manager.save(log);
    });
    // Note: If any error occurs inside this block, TypeORM automatically rolls back.
  }
}