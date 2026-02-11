import { ApiProperty } from '@nestjs/swagger';
import { OrderSide, OrderStatus } from '../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty({ enum: OrderSide })
  side: OrderSide;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  marginUsed: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  createdAt: Date;
}
