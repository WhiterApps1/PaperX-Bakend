import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStatusDto {
  @ApiProperty({
    example: true,
    description: 'Set user account active or inactive',
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return false;
  })
  @IsBoolean({
    message: 'status must be a boolean value (true or false)',
  })
  status: boolean;
}
