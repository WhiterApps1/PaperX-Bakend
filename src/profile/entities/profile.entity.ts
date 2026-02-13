import { ApiProperty } from '@nestjs/swagger';
import { Roles } from 'src/firebase_auth/roles.enum';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'profile-uuid-12345', description: 'Profile ID' })
  id: string;

  @Column({ length: 200 })
  @ApiProperty({ example: 'John Doe', description: 'Profile name' })
  name: string;

  @Column({
    type: 'enum',
    enum: Roles,
    array: true,
    default: [Roles.USER],
  })
  @ApiProperty({
    description: 'Assigned roles for this profile',
    enum: Roles,
    isArray: true,
    example: [Roles.ADMIN, Roles.USER],
  })
  role: Roles[];

  @ManyToMany(() => Permission, (permission) => permission.profiles, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];

  @OneToMany(() => User, (employee) => employee.profile)
  user: User[];
}
