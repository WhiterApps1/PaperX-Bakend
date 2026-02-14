import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseGuard } from '@alpha018/nestjs-firebase-auth';
import { PositionsService } from './positions.service';
import { ListPositionsDto } from './dto/list-positions.dto';
import { FirebaseAuthService } from '../firebase_auth/firebase_auth.service';

@ApiTags('Trading - Positions')
@Controller('trading/positions')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class PositionsController {
  constructor(
    private readonly positionsService: PositionsService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  /* ----------------------------------------
     List All Positions (Current User)
  ---------------------------------------- */
  @Get()
  @ApiOperation({ summary: 'List all positions' })
  @ApiResponse({ status: 200, description: 'Positions list' })
  async list(@Req() req: Request, @Query() query: ListPositionsDto) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.positionsService.listPositions(user.email!, query);
  }

  /* ----------------------------------------
     Get One Position (Current User)
  ---------------------------------------- */
  @Get(':id')
  @ApiOperation({ summary: 'Get position details' })
  @ApiResponse({ status: 200, description: 'Position details' })
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.positionsService.getPosition(id, user.email!);
  }

  /* ----------------------------------------
     Get Position Risk Metrics
  ---------------------------------------- */
  @Get(':id/risk-metrics')
  @ApiOperation({ summary: 'Get position risk metrics' })
  @ApiResponse({ status: 200, description: 'Risk metrics' })
  async getRiskMetrics(@Req() req: Request, @Param('id') id: string) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);

    return this.positionsService.getPositionRiskMetrics(id, user.email!);
  }
}
