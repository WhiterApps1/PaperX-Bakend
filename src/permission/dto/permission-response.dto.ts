import { ApiProperty } from '@nestjs/swagger';
import {
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';

export class PermissionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty({ enum: PermissionResource })
  resource: PermissionResource;

  @ApiProperty({ example: 'read:portfolio' })
  key: string;
}
