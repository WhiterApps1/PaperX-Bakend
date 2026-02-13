import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity()
export class Wallet {
  @ApiProperty({
    example: '9a7b6c5d-4e3f-4a2b-8c1d-5e6f7a8b9c0d',
    description: 'Unique identifier for the wallet (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @OneToOne(() => User, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

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
