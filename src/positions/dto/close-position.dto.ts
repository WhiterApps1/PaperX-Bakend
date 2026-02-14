import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ClosePositionDto {
  @ApiProperty({
    description: 'Exit price at which the position is closed',
    example: 2540.75,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  exitPrice: number;
}
