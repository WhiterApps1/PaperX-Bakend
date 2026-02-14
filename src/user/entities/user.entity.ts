import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Profile } from 'src/profile/entities/profile.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Exclude } from 'class-transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Position } from 'src/positions/entities/position.entity';
import { SquareOff } from 'src/square-off/entities/square-off.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'user-uuid-12345', description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'captain@example.com',
    description: 'Email address of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Column()
  lastName: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user account is active',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if the email is verified',
  })
  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @ApiHideProperty()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @ApiHideProperty()
  @ManyToOne(() => Profile, (profile) => profile.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile | null;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: User | null;

  @ApiHideProperty()
  @OneToMany(() => User, (user) => user.parent)
  children: User[];

  @ApiHideProperty()
  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @ApiHideProperty()
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Position, (position) => position.user)
  positions: Position[];

  @ApiHideProperty()
  @OneToMany(() => SquareOff, (squareOff) => squareOff.client)
  squareOffs: SquareOff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
