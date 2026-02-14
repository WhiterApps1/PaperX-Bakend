import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseGuard } from '@alpha018/nestjs-firebase-auth';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { FirebaseAuthService } from '../firebase_auth/firebase_auth.service';

@ApiTags('Trading - Orders')
@Controller('trading/orders')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  @UseGuards(FirebaseGuard)
  @Post()
  @ApiOperation({ summary: 'Place a new trading order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Body() dto: CreateOrderDto, req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.ordersService.createOrder(user.email!, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  @ApiResponse({ status: 200, description: 'Orders list' })
  async list(@Query() query: ListOrdersDto, req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.ordersService.listOrders(user.email!, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order details' })
  async getOne(@Param('id') id: string, req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.ordersService.getOrder(id, user.email!);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  async cancel(@Param('id') id: string, req: any) {
    const user = await this.firebaseAuthService.decodeTokenFromRequest(req);
    return this.ordersService.cancelOrder(id, user.email!);
  }
}
