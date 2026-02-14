import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SquareOffTrigger {
  AUTO = 'AUTO', // Triggered by auto square-off worker
  ADMIN = 'ADMIN', // Triggered by admin manually
  MARGIN_CALL = 'MARGIN_CALL', // Triggered due to margin call
}

export enum SquareOffStatus {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL', // Some positions closed, some failed
}

@Entity()
export class SquareOff {
  @ApiProperty({
    example: '7f9e4a2d-6b3c-4f1a-9e5d-8c3f2a1b0e9d',
    description: 'Unique identifier for the square-off event (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.squareOffs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ApiHideProperty()
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'triggered_by_id' })
  triggeredBy: User | null; // Admin who triggered manual square-off

  @ApiProperty({
    enum: SquareOffTrigger,
    example: SquareOffTrigger.AUTO,
    description: 'What triggered the square-off event',
  })
  @Column({
    type: 'enum',
    enum: SquareOffTrigger,
  })
  trigger: SquareOffTrigger;

  @ApiProperty({
    enum: SquareOffStatus,
    example: SquareOffStatus.IN_PROGRESS,
    description: 'Current status of the square-off process',
  })
  @Column({
    type: 'enum',
    enum: SquareOffStatus,
  })
  status: SquareOffStatus;

  @ApiProperty({
    example: 1500.5,
    description: 'Client balance at time of square-off trigger',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAtTrigger: number;

  @ApiProperty({
    example: 1000,
    description: 'Threshold limit that triggered the square-off',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  thresholdLimit: number | null;

  @ApiProperty({
    example: 5,
    description: 'Total positions that were open',
  })
  @Column({ type: 'int', default: 0 })
  totalPositions: number;

  @ApiProperty({
    example: 4,
    description: 'Number of positions successfully closed',
  })
  @Column({ type: 'int', default: 0 })
  closedPositions: number;

  @ApiProperty({
    example: 1,
    description: 'Number of positions failed to close',
  })
  @Column({ type: 'int', default: 0 })
  failedPositions: number;

  @ApiProperty({
    example: 2500.75,
    description: 'Total margin released by closing positions',
  })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalMarginReleased: number;

  @ApiProperty({
    example: 'Auto square-off triggered due to balance threshold breach',
    description: 'Reason for square-off',
  })
  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @ApiProperty({
    example: 'Failed to close position XYZ due to network error',
    description: 'Details about failures if any',
  })
  @Column({ type: 'text', nullable: true })
  failureDetails: string | null;

  @ApiProperty({
    example: '2026-02-14T10:30:00.000Z',
    description: 'When the square-off was initiated',
  })
  @CreateDateColumn()
  initiatedAt: Date;

  @ApiProperty({
    example: '2026-02-14T10:31:15.000Z',
    description: 'When the square-off completed',
  })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ApiProperty({
    example: '2026-02-14T10:31:15.000Z',
    description: 'Last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
