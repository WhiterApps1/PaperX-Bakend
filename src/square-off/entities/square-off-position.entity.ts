import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SquareOff } from './square-off.entity';
import { Position } from '../../positions/entities/position.entity';

export enum SquareOffPositionStatus {
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  FAILED = 'FAILED',
}

@Entity()
export class SquareOffPosition {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p',
    description: 'Unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => SquareOff, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'square_off_id' })
  squareOff: SquareOff;

  @ApiHideProperty()
  @OneToOne(() => Position, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @ApiProperty({
    enum: SquareOffPositionStatus,
    example: SquareOffPositionStatus.CLOSED,
  })
  @Column({
    type: 'enum',
    enum: SquareOffPositionStatus,
  })
  status: SquareOffPositionStatus;

  @ApiProperty({
    example: 'BTCUSDT',
    description: 'Symbol of the closed position',
  })
  @Column()
  symbol: string;

  @ApiProperty({
    example: 0.5,
    description: 'Quantity closed',
  })
  @Column()
  quantity: number;

  @ApiProperty({
    example: 42500.75,
    description: 'Entry price of the position',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  entryPrice: number;

  @ApiProperty({
    example: 42500,
    description: 'Market price at time of square-off',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  exitPrice: number | null;

  @ApiProperty({
    example: 1250.25,
    description: 'Margin released from this position',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  marginReleased: number | null;

  @ApiProperty({
    example: 'Closed successfully at market price',
  })
  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @ApiProperty({
    example: '2026-02-14T10:31:00.000Z',
  })
  @CreateDateColumn()
  closedAt: Date;
}
