import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from 'src/user/entities/user.entity';

export enum AuditType {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

@Entity()
export class TradeAudit {
  @ApiProperty({
    example: 'c1b3f9e2-7a6a-4a1b-9c42-9f1c2e3a4d5b',
    description: 'Unique identifier for the trade audit record (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => Order, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiHideProperty()
  @ManyToOne(() => User, {
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
  @JoinColumn({ name: 'initiated_by_id' })
  initiatedBy: User | null;

  @ApiProperty({
    enum: AuditType,
    example: AuditType.ADMIN,
    description: 'Type of initiator (ADMIN or CLIENT)',
  })
  @Column({
    type: 'enum',
    enum: AuditType,
  })
  type: AuditType;

  @ApiProperty({
    example: '2026-02-12T13:45:30.000Z',
    description: 'Timestamp when the audit record was created (UTC)',
  })
  @CreateDateColumn()
  createdAt: Date;
}
