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
  ApiOperation,
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

  /* ------------------------------- Create ------------------------------- */

  @Post()
  @ApiOperation({
    summary: 'Create permission',
    description: 'Create a new permission with the provided details.',
  })
  @ApiCreatedResponse({ type: PermissionResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  /* -------------------------------- Read -------------------------------- */

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieve a list of all available permissions.',
  })
  @ApiOkResponse({ type: [PermissionResponseDto] })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Retrieve a single permission using its unique ID.',
  })
  @ApiOkResponse({ type: PermissionResponseDto })
  @ApiNotFoundResponse({ description: 'Permission not found' })
  findOne(@Param('id') id: number) {
    return this.permissionService.findOne(Number(id));
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update permission',
    description: 'Update permission information by permission ID.',
  })
  @ApiOkResponse({ type: PermissionResponseDto })
  @ApiNotFoundResponse({ description: 'Permission not found' })
  update(@Param('id') id: number, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update(Number(id), dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete permission',
    description: 'Permanently delete a permission by ID.',
  })
  @ApiOkResponse({ description: 'Permission deleted successfully' })
  @ApiNotFoundResponse({ description: 'Permission not found' })
  remove(@Param('id') id: number) {
    return this.permissionService.remove(Number(id));
  }
}
