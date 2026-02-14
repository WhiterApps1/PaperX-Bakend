import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
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

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @ApiHideProperty()
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'initiated_by_id' })
  initiatedBy: User | null;

  @ApiProperty({
    example: '2026-02-12T15:10:30.000Z',
    description: 'Timestamp when the order was created (UTC)',
  })
  @CreateDateColumn()
  createdAt: Date;
}
