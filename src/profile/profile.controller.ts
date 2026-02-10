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
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /* ------------------------------- Create ------------------------------- */

  @Post()
  @ApiCreatedResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse()
  create(@Body() dto: CreateProfileDto) {
    return this.profileService.create(dto);
  }

  /* -------------------------------- Read -------------------------------- */

  @Get()
  @ApiOkResponse({ type: [ProfileResponseDto] })
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse()
  findOne(@Param('id') id: number) {
    return this.profileService.findOne(Number(id));
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse()
  update(@Param('id') id: number, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(Number(id), dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOkResponse({ description: 'Profile deleted' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  remove(@Param('id') id: number) {
    return this.profileService.remove(Number(id));
  }
}
