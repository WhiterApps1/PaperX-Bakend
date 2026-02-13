import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
} from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'b7e9c8a2-4d2a-4f90-9b1e-3c12e8a45f91',
    description: 'Unique identifier for the permission.',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: PermissionAction,
    example: PermissionAction.READ,
    description: 'Action that can be performed on a resource.',
  })
  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @ApiProperty({
    enum: PermissionResource,
    example: PermissionResource.PORTFOLIO,
    description: 'Target resource on which the action is applied.',
  })
  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @ApiProperty({
    example: 'read:portfolio',
    description:
      'Permission key in "action:resource" format, used for access control and policy checks.',
    minLength: 3,
    maxLength: 100,
  })
  @Column({
    unique: true,
    length: 100,
  })
  key: string;

  @ApiHideProperty()
  @ManyToMany(() => Profile, (profile) => profile.permissions)
  profiles: Profile[];
}
