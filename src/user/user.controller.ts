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
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /* -------------------------------- Read -------------------------------- */

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: number) {
    return this.userService.findOne(Number(id));
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse()
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(Number(id), dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOkResponse({ description: 'User deleted' })
  @ApiNotFoundResponse()
  remove(@Param('id') id: number) {
    return this.userService.remove(Number(id));
  }

  /* ---------------------------- Enable/Disable -------------------------- */

  @Patch(':id/status/:status')
  @ApiOkResponse({ type: UserResponseDto })
  setActive(@Param('id') id: number, @Param('status') status: string) {
    return this.userService.setActive(Number(id), status === 'true');
  }
}
