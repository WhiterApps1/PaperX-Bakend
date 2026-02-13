import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { OrderSide } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    example: 'AAPL',
    description: 'Trading symbol / instrument code',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    enum: OrderSide,
    example: OrderSide.BUY,
  })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({
    example: 180.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  exposure: number;

  // ADMIN ONLY FIELD

  @ApiPropertyOptional({
    example: '8f3c2a91-4d5e-4b7f-9a12-6c3e5d7f8a90',
    description: 'Client ID (admins only)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;
}
