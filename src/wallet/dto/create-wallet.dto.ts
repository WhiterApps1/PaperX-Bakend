import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The UUID of the parent user',
  })
  userId: string;

  @ApiProperty({
    example: 1000.0,
    description: 'The starting credit balance for the parent',
  })
  initialBalance: number;
}
