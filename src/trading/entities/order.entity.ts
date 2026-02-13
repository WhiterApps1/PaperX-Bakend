import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Order {
  @ApiProperty({
    example: '3e7b1a92-4c5d-4e8f-9b21-7a6c5d4f3e2a',
    description: 'Unique identifier for the order (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'USR-9f8e7d6c5b4a',
    description: 'User identifier who placed this order',
  })
  @Column()
  userId: string;

  @ApiProperty({
    example: 'ETHUSDT',
    description: 'Trading symbol / instrument',
  })
  @Column()
  symbol: string;

  @ApiProperty({
    enum: OrderSide,
    example: OrderSide.BUY,
    description: 'Order side (BUY or SELL)',
  })
  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  @ApiProperty({
    example: '1825.50',
    description: 'Order price (stored as decimal for financial precision)',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the asset in the order',
  })
  @Column()
  quantity: number;

  @ApiProperty({
    example: '950.00',
    description: 'Margin used for this order (stored as decimal for accuracy)',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  marginUsed: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.OPEN,
    description: 'Current status of the order',
  })
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional({
    example: 'ADM-123456',
    description:
      'Administrator ID if the order was placed on behalf of a user (masquerade mode)',
    nullable: true,
  })
  @Column({ nullable: true })
  initiatedBy: string | null;

  @ApiProperty({
    example: '2026-02-12T15:10:30.000Z',
    description: 'Timestamp when the order was created (UTC)',
  })
  @CreateDateColumn()
  createdAt: Date;
}
