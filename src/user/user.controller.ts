import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AssignParentDto } from './dto/assign-parent.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* ------------------------------- Create ------------------------------- */

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user with the provided details.',
  })
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /* -------------------------------- Read -------------------------------- */

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all registered users.',
  })
  @ApiOkResponse({ type: [User] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a single user using their unique ID.',
  })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.findOne(id);
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by user ID.',
  })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user by ID.',
  })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.remove(id);
  }

  /* ---------------------------- Enable/Disable -------------------------- */

  @Patch(':id/status/:status')
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Enable or disable a user account by setting status to true or false.',
  })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  setActive(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.userService.setActive(id, dto.status);
  }

  /* -------------------------- Assign Parent -------------------------- */

  @Patch(':id/parent')
  @ApiOperation({
    summary: 'Assign parent to user',
    description: 'Assign a manager/admin as parent',
  })
  @ApiOkResponse({
    description: 'Parent assigned successfully',
  })
  async assignParent(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignParentDto,
  ) {
    await this.userService.assignParent(id, dto.parentId);

    return {
      success: true,
      message: 'Parent assigned successfully',
    };
  }

  /* -------------------------- Remove Parent -------------------------- */

  @Delete(':id/parent')
  @ApiOperation({
    summary: 'Remove parent from user',
    description: 'Detach user from parent',
  })
  @ApiOkResponse({
    description: 'Parent removed successfully',
  })
  async removeParent(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    await this.userService.removeParent(id);

    return {
      success: true,
      message: 'Parent removed successfully',
    };
  }

  /* -------------------------- Get Children -------------------------- */

  @Get(':id/children')
  @ApiOperation({
    summary: 'Get children of user',
    description: 'Fetch all direct sub-users',
  })
  @ApiOkResponse({
    type: [User],
  })
  async getChildren(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.userService.getChildren(id);
  }
}
