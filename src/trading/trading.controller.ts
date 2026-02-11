import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TradingService } from './trading.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { FirebaseAuthGuard } from 'src/firebase_auth/firebase.auth.guard';
import { FirebaseAuthService } from 'src/firebase_auth/firebase_auth.service';

@ApiTags('Trading')
@ApiBearerAuth('bearerAuth')
@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('place')
  @ApiCreatedResponse({ description: 'Order placed' })
  async place(@Req() req, @Body() dto: PlaceOrderDto) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.tradingService.placeOrder(user.email!, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('position/:id')
  @ApiOperation({ summary: 'Close position' })
  async closePosition(@Param('id') id: string, @Req() req) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.tradingService.closePosition(id, user.email!);
  }
}
