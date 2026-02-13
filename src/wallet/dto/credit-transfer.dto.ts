import { ApiProperty } from '@nestjs/swagger';

export class CreditTransferDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The UUID of the parent user',
  })
  parentId: string;

  @ApiProperty({
    example: '827c1f8d-7132-4d10-8b1b-53531b4a0c22',
    description: 'The UUID of the child user',
  })
  childId: string;

  @ApiProperty({
    example: 50.0,
    description: 'The amount of credits to move (must be positive)',
  })
  amount: number;
}
