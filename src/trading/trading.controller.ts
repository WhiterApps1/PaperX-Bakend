import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FirebaseAuthService } from 'src/firebase_auth/firebase_auth.service';
import { FirebaseGuard } from '@alpha018/nestjs-firebase-auth';

@ApiTags('Trading')
@ApiBearerAuth('bearerAuth')
@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @UseGuards(FirebaseGuard)
  @Post('orders')
  @ApiOperation({
    summary: 'Place a new trading order',
    description:
      'Creates a new trading order for the authenticated user. The user is identified from the Firebase JWT token.',
  })
  async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.tradingService.createOrder(user.email!, dto);
  }

  @UseGuards(FirebaseGuard)
  @Delete('positions/:id')
  @ApiOperation({
    summary: 'Close an open trading position',
    description:
      'Closes an existing open position for the authenticated user. The position must belong to the logged-in user.',
  })
  async closePosition(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req,
  ) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.tradingService.closePosition(id, user.email!);
  }
}
