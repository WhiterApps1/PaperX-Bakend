import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ enum: PermissionAction })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiProperty({ enum: PermissionResource })
  @IsEnum(PermissionResource)
  resource: PermissionResource;
}
