import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseGuard } from '@alpha018/nestjs-firebase-auth';
import { SquareOffService } from './square-off.service';
import { ManualSquareOffDto } from './dto/manual-square-off.dto';
import { FirebaseAuthService } from '../firebase_auth/firebase_auth.service';

@ApiTags('Trading - Square-Off')
@Controller('trading/square-off')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class SquareOffController {
  constructor(
    private readonly squareOffService: SquareOffService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @Post('manual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger square-off for a client (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Square-off triggered successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async manualSquareOff(@Body() dto: ManualSquareOffDto, @Req() req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.squareOffService.manualSquareOff(user.email!, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get square-off history' })
  @ApiResponse({ status: 200, description: 'Square-off history' })
  async getHistory(
    @Req() req: any,
    @Query('clientId') clientId?: string,
    @Query('limit') limit: number = 50,
  ) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.squareOffService.getSquareOffHistory(
      user.email!,
      clientId,
      limit,
    );
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Get details of a square-off event' })
  @ApiResponse({ status: 200, description: 'Square-off details' })
  @ApiResponse({ status: 404, description: 'Square-off not found' })
  async getDetails(@Param('id') squareOffId: string, @Req() req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.squareOffService.getSquareOffDetails(user.email!, squareOffId);
  }

  @Get('risk-status')
  @ApiOperation({ summary: 'Get current risk status' })
  @ApiResponse({ status: 200, description: 'Risk status' })
  async getRiskStatus(@Req() req: any, @Query('clientId') clientId?: string) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.squareOffService.getRiskStatus(user.email!, clientId);
  }
}
