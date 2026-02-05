import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase_auth.service';
import { FirebaseAuthController } from './firebase_auth.controller';

@Module({
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class FirebaseAuthModule {}
