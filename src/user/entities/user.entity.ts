import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from 'src/profile/entities/profile.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'captain@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name of the employee' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the employee' })
  @Column()
  lastName: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Hashed password' })
  @Column()
  passwordHash: string;

  @ManyToOne(() => Profile, (profile) => profile.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
