import { Body, Controller, Param, Post } from '@nestjs/common';
import { FirebaseAuthService } from './firebase_auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SetRolesDto } from './dto/set-roles.dto';
import { FirebaseUserDto } from './dto/create-firebase-user.dto';

@ApiTags('Firebase-Auth')
@ApiBearerAuth('bearerAuth')
@Controller('firebase-auth')
export class FirebaseAuthController {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  @Post('/user')
  @ApiOperation({
    summary: 'Create a Firebase user using email and password',
    description:
      'Creates a new Firebase user with the provided email and password. The email will be marked as verified.',
  })
  @ApiBody({ type: FirebaseUserDto })
  @ApiResponse({
    status: 201,
    description: 'Firebase user created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email, password, or Firebase error',
  })
  async createUser(@Body() dto: FirebaseUserDto) {
    return this.firebaseAuthService.createUser(dto.email, dto.password);
  }

  @Post('/user/roles/:uid')
  @ApiOperation({
    summary: 'Assigns multiple roles to a single Firebase user ID',
    description: 'Assigns multiple roles to a Firebase user identified by UID.',
  })
  @ApiBody({
    type: SetRolesDto,
  })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid UID, roles, or Firebase error.',
  })
  @Post('/set-roles/:uid')
  async setMultipleRoles(@Param('uid') uid: string, @Body() body: SetRolesDto) {
    return this.firebaseAuthService.setRoles(uid, body.roles);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticate a Firebase user using email and password and return an ID token.',
  })
  @ApiBody({ type: FirebaseUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Firebase ID token returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body.',
  })
  login(@Body() dto: FirebaseUserDto) {
    return this.firebaseAuthService.loginWithEmailPassword(
      dto.email,
      dto.password,
    );
  }
}
