import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CreditTransactionType {
  PUSH = 'PUSH',
  RECLAIM = 'RECLAIM',
}

@Entity()
export class CreditTransaction {
  @ApiProperty({
    example: 'f3c9b2a1-7d5e-4a2b-9c8d-6e5f4a3b2c1d',
    description: 'Unique identifier for the credit transaction (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'USR-123456',
    description: 'User ID of the sender',
  })
  @Column()
  senderId: string;

  @ApiProperty({
    example: 'USR-654321',
    description: 'User ID of the receiver',
  })
  @Column()
  receiverId: string;

  @ApiProperty({
    example: '500.00',
    description:
      'Transaction amount (stored as decimal for financial precision)',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    enum: CreditTransactionType,
    example: CreditTransactionType.PUSH,
    description: 'Type of transaction (PUSH or RECLAIM)',
  })
  @Column({
    type: 'enum',
    enum: CreditTransactionType,
  })
  type: CreditTransactionType;

  @ApiProperty({
    example: '2026-02-12T16:45:00.000Z',
    description: 'Timestamp when the transaction was created (UTC)',
  })
  @CreateDateColumn()
  createdAt: Date;
}
