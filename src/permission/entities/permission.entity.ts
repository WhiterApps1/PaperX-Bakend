import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from 'src/profile/entities/profile.entity';

export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
}

export enum PermissionResource {
  USERS = 'users',
  PORTFOLIO = 'portfolio',
  ORDERS = 'orders',
  TRADES = 'trades',
  STRATEGIES = 'strategies',
  ANALYTICS = 'analytics',
  SYSTEM = 'system',
}

@Entity('permissions')
@Unique(['action', 'resource'])
export class Permission {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: PermissionAction })
  @Column({ type: 'enum', enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty({ enum: PermissionResource })
  @Column({ type: 'enum', enum: PermissionResource })
  resource: PermissionResource;

  @ApiProperty({
    example: 'read:portfolio',
  })
  @Column()
  key: string;

  @ManyToMany(() => Profile, (profile) => profile.permissions)
  profiles: Profile[];
}
