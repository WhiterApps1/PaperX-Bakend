import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { OrderSide } from '../entities/order.entity';

export class PlaceOrderDto {
  @ApiProperty({
    example: 'AAPL',
    description: 'Trading symbol / instrument code',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    enum: OrderSide,
    example: OrderSide.BUY,
    description: 'Order side (BUY or SELL)',
  })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({
    example: 180.5,
    description: 'Limit price per unit (must be greater than 0)',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({
    example: 10,
    description: 'Number of units to buy or sell (must be at least 1)',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 5,
    description: 'Leverage / exposure multiplier for this order',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  exposure: number;
}
