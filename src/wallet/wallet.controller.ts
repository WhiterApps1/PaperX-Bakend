import { Controller, Post, Body, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto, CreditTransferDto } from './dto/create-wallet.dto'



@ApiTags('Internal Credit Management')
@Controller('internal/credits')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('initialize-parent')
  @ApiOperation({ 
    summary: 'Initialize Parent Wallet', 
    description: 'Creates a new wallet for a parent user with a specific starting balance.' 
  })
  @ApiResponse({ status: 201, description: 'Wallet created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid initial balance.' })
  @ApiResponse({ status: 409, description: 'Wallet already exists for this user.' })
  async initializeParent(@Body() dto: CreateWalletDto) {
    if (dto.initialBalance < 0) {
      throw new BadRequestException('Initial balance cannot be negative');
    }
    return this.walletService.createWallet(dto.userId, dto.initialBalance);
  }

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