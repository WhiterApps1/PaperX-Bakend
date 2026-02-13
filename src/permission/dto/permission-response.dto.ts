import { ApiProperty } from '@nestjs/swagger';
import {
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';

export class PermissionResponseDto {
  @ApiProperty({ example: 'b7e9c8a2-4d2a-4f90-9b1e-3c12e8a45f91' })
  id: string;

  @ApiProperty({ enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty({ enum: PermissionResource })
  resource: PermissionResource;

  @ApiProperty({ example: 'read:portfolio' })
  key: string;
}
