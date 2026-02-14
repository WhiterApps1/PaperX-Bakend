import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseGuard } from '@alpha018/nestjs-firebase-auth';
import { PortfolioService } from './portfolio.service';
import { PaginationDto } from './dto/pagination.dto';
import { FirebaseAuthService } from '../firebase_auth/firebase_auth.service';

@ApiTags('Trading - Portfolio')
@Controller('trading/portfolio')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get portfolio summary' })
  @ApiResponse({ status: 200, description: 'Portfolio summary' })
  async getSummary(req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getPortfolioSummary(user.email!);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get balance information' })
  @ApiResponse({ status: 200, description: 'Balance details' })
  async getBalance(req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getBalance(user.email!);
  }

  @Get('holdings')
  @ApiOperation({ summary: 'Get current holdings' })
  @ApiResponse({ status: 200, description: 'Holdings list' })
  async getHoldings(req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getHoldings(user.email!);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get order history' })
  @ApiResponse({ status: 200, description: 'Order history' })
  async getHistory(@Query() pagination: PaginationDto, req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getHistory(user.email!, pagination);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get trading performance' })
  @ApiResponse({ status: 200, description: 'Performance metrics' })
  async getPerformance(req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getPerformance(user.email!);
  }

  @Get('risk')
  @ApiOperation({ summary: 'Get portfolio risk assessment' })
  @ApiResponse({ status: 200, description: 'Risk metrics' })
  async getRisk(req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.portfolioService.getPortfolioRisk(user.email!);
  }
}
