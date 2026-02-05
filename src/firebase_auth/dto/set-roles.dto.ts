import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { Roles } from '../roles.enum';

export class SetRolesDto {
  @ApiProperty({
    description: 'An array of roles to be assigned to the user.',
    type: 'string',
    enum: Roles,
    isArray: true,
    example: [Roles.ADMIN, Roles.HOTEL_ADMIN, Roles.RECEPTION, Roles.USER],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Roles, { each: true })
  roles: Roles[];
}
