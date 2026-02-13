import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The UUID of the parent user',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 1000.0,
    description: 'The starting credit balance for the parent',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  initialBalance: number;
}
