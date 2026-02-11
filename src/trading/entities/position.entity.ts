import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  symbol: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  entryPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  marginUsed: number;

  @CreateDateColumn()
  openedAt: Date;
}
