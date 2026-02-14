import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ManualSquareOffDto {
  @ApiProperty({
    description: 'Client unique identifier (email or user ID)',
    example: 'client@example.com',
  })
  @IsString()
  clientId: string;

  @ApiPropertyOptional({
    description: 'Reason for manual square-off (optional)',
    example: 'High margin utilization',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
