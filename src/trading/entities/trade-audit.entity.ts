import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ApiProperty({
    example: 'ORD-20260212-0001',
    description: 'Associated order identifier',
  })
  @Column()
  orderId: string;

  @ApiProperty({
    example: 'USR-9f8e7d6c5b4a',
    description: 'Client/User identifier related to this trade',
  })
  @Column()
  clientId: string;

  @ApiProperty({
    example: 'ADM-123456',
    description: 'Administrator/User ID who initiated this action',
  })
  @Column()
  initiatedBy: string;

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
