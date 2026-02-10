import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { FirebaseAuthModule } from 'src/firebase_auth/firebase_auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), FirebaseAuthModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
