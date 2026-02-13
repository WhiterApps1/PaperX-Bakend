import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Profile } from 'src/profile/entities/profile.entity';

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

  @ApiPropertyOptional({ description: 'Hashed password' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @ManyToOne(() => Profile, (profile) => profile.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @OneToMany(() => User, (user) => user.parent)
  children: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
