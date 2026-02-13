import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignParentDto {
  @ApiProperty({
    example: 'b7e9c8a2-4d2a-4f90-9b1e-3c12e8a45f91',
    description: 'Parent user ID (Admin / Manager)',
  })
  @IsUUID()
  parentId: string;
}
