import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  MaxLength,
  ArrayNotEmpty,
} from 'class-validator';
import { Roles } from 'src/firebase_auth/roles.enum';

export class CreateProfileDto {
  @ApiProperty({
    example: 'Admin Profile',
    description: 'Display name of the profile/role group',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    enum: Roles,
    isArray: true,
    example: [Roles.ADMIN, Roles.USER],
    description: 'Roles assigned to this profile',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Roles, { each: true })
  role?: Roles[];

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'List of permission IDs associated with this profile',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
