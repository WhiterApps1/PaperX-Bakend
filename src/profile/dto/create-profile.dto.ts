import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from 'src/firebase_auth/roles.enum';

export class CreateProfileDto {
  @ApiProperty({
    example: 'Admin Profile',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: Roles,
    isArray: true,
    example: [Roles.ADMIN, Roles.USER],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Roles, { each: true })
  role?: Roles[];

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Permission IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  permissionIds?: number[];
}
