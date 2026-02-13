import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PlaceOrderDto } from './place-order.dto';

export class AdminPlaceOrderDto extends PlaceOrderDto {
  @ApiProperty({
    example: '8f3c2a91-4d5e-4b7f-9a12-6c3e5d7f8a90',
    description:
      'Target client user ID for whom the admin is placing this order (UUID)',
    format: 'uuid',
  })
  @IsUUID()
  clientId: string;
}
