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
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /* ------------------------------- Create ------------------------------- */

  @Post()
  @ApiOperation({
    summary: 'Create profile',
    description: 'Create a new profile with the provided details.',
  })
  @ApiCreatedResponse({ type: Profile })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() dto: CreateProfileDto) {
    return this.profileService.create(dto);
  }

  /* -------------------------------- Read -------------------------------- */

  @Get()
  @ApiOperation({
    summary: 'Get all profiles',
    description: 'Retrieve a list of all available profiles.',
  })
  @ApiOkResponse({ type: [Profile] })
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile by ID',
    description: 'Retrieve a single profile using its unique ID.',
  })
  @ApiOkResponse({ type: Profile })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  /* ------------------------------- Update ------------------------------- */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update profile information by profile ID.',
  })
  @ApiOkResponse({ type: Profile })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(id, dto);
  }

  /* ------------------------------- Delete ------------------------------- */

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete profile',
    description: 'Permanently delete a profile by ID.',
  })
  @ApiOkResponse({ description: 'Profile deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid profile ID' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
