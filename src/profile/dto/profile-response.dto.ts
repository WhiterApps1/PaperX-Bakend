import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponseDto } from '../../permission/dto/permission-response.dto';
import { Roles } from 'src/firebase_auth/roles.enum';

export class ProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Admin Profile' })
  name: string;

  @ApiProperty({
    enum: Roles,
    isArray: true,
  })
  role: Roles[];

  @ApiProperty({
    type: () => [PermissionResponseDto],
  })
  permissions: PermissionResponseDto[];
}
