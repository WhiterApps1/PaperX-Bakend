import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({
    enum: PermissionAction,
    example: PermissionAction.READ,
    description:
      'Action to be performed on the resource (e.g., read, create, update, delete, execute).',
  })
  @IsEnum(PermissionAction, {
    message: 'action must be a valid PermissionAction value',
  })
  action: PermissionAction;

  @ApiProperty({
    enum: PermissionResource,
    example: PermissionResource.PORTFOLIO,
    description:
      'Target resource on which the action will be applied (e.g., portfolio, users, orders).',
  })
  @IsEnum(PermissionResource, {
    message: 'resource must be a valid PermissionResource value',
  })
  resource: PermissionResource;
}
