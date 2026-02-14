import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Position {
  @ApiProperty({
    example: '8f3c2a91-4d5e-4b7f-9a12-6c3e5d7f8a90',
    description: 'Unique identifier for the trading position (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.positions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

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
