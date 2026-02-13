import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Wallet {
  @ApiProperty({
    example: '9a7b6c5d-4e3f-4a2b-8c1d-5e6f7a8b9c0d',
    description: 'Unique identifier for the wallet (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'USR-123456',
    description: 'User identifier who owns this wallet',
  })
  @Column()
  userId: string;

  @ApiProperty({
    example: '10000.00',
    description: 'Available wallet balance (stored as decimal for accuracy)',
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  balance: number;

  @ApiProperty({
    example: '2500.00',
    description: 'Locked funds reserved for open positions or pending orders',
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  locked: number;
}
