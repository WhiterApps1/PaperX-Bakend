import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderSide } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Trading symbol (stock, crypto, or instrument code)',
    example: 'AAPL',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Order side / type',
    enum: OrderSide,
    example: OrderSide.BUY,
  })
  @IsEnum(OrderSide)
  orderType: OrderSide;

  @ApiProperty({
    description: 'Number of units to trade',
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Limit/market price per unit',
    example: 152.75,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Client identifier (for admin / trade-on-behalf orders)',
    example: 'client@example.com',
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}
