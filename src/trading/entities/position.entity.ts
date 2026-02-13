import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Position {
  @ApiProperty({
    example: '8f3c2a91-4d5e-4b7f-9a12-6c3e5d7f8a90',
    description: 'Unique identifier for the trading position (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'USR-9f8e7d6c5b4a',
    description: 'User identifier who owns this position',
  })
  @Column()
  userId: string;

  @ApiProperty({
    example: 'BTCUSDT',
    description: 'Trading symbol / instrument code',
  })
  @Column()
  symbol: string;

  @ApiProperty({
    example: 0.25,
    description: 'Quantity of the asset in this position',
  })
  @Column()
  quantity: number;

  @ApiProperty({
    example: '42500.75',
    description:
      'Entry price of the position (stored as decimal for precision)',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  entryPrice: number;

  @ApiProperty({
    example: '1500.00',
    description:
      'Margin used to open this position (stored as decimal for accuracy)',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  marginUsed: number;

  @ApiProperty({
    example: '2026-02-12T14:20:45.000Z',
    description: 'Timestamp when the position was opened (UTC)',
  })
  @CreateDateColumn()
  openedAt: Date;
}
