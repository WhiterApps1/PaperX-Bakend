import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiCreatedResponse({ type: PermissionResponseDto })
  @ApiBadRequestResponse()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [PermissionResponseDto] })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PermissionResponseDto })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: number) {
    return this.permissionService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: PermissionResponseDto })
  @ApiNotFoundResponse()
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Permission deleted' })
  @ApiNotFoundResponse()
  remove(@Param('id') id: number) {
    return this.permissionService.remove(Number(id));
  }
}
