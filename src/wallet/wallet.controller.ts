import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

// DTO for documentation and validation
class CreditTransferDto {
  @ApiProperty({ 
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851', 
    description: 'The UUID of the parent user' 
  })
  parentId: string;

  @ApiProperty({ 
    example: '827c1f8d-7132-4d10-8b1b-53531b4a0c22', 
    description: 'The UUID of the child user' 
  })
  childId: string;

  @ApiProperty({ 
    example: 50.00, 
    description: 'The amount of credits to move (must be positive)' 
  })
  amount: number;
}

@ApiTags('Internal Credit Management')
@Controller('internal/credits')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('push')
  @ApiOperation({ 
    summary: 'Push credits to a child', 
    description: 'Deducts credits from parent balance and adds to child balance. Operates atomically.' 
  })
  @ApiResponse({ status: 201, description: 'Credits transferred successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient funds or invalid amount.' })
  @ApiResponse({ status: 500, description: 'Internal server error during transaction.' })
  async pushToChild(@Body() dto: CreditTransferDto) {
    return this.walletService.transferCredits(dto.parentId, dto.childId, dto.amount, 'PUSH');
  }

  @Post('reclaim')
  @ApiOperation({ 
    summary: 'Reclaim credits from a child', 
    description: 'Retrieves credits from a child wallet and returns them to the parent wallet.' 
  })
  @ApiResponse({ status: 201, description: 'Credits reclaimed successfully.' })
  @ApiResponse({ status: 400, description: 'Child has insufficient balance to reclaim.' })
  async reclaimFromChild(@Body() dto: CreditTransferDto) {
    // Note: Sender is Child, Receiver is Parent
    return this.walletService.transferCredits(dto.childId, dto.parentId, dto.amount, 'RECLAIM');
  }
}