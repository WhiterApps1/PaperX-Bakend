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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

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
  @ApiCreatedResponse({ type: UserResponseDto })
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
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a single user using their unique ID.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: number) {
    return this.userService.findOne(Number(id));
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by user ID.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(Number(id), dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user by ID.',
  })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id') id: number) {
    return this.userService.remove(Number(id));
  }

  /* ---------------------------- Enable/Disable -------------------------- */

  @Patch(':id/status/:status')
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Enable or disable a user account by setting status to true or false.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  setActive(@Param('id') id: number, @Param('status') status: string) {
    return this.userService.setActive(Number(id), status === 'true');
  }
}
