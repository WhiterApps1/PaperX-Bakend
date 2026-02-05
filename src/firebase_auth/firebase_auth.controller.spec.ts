import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthController } from './firebase_auth.controller';
import { FirebaseAuthService } from './firebase_auth.service';

describe('FirebaseAuthController', () => {
  let controller: FirebaseAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirebaseAuthController],
      providers: [FirebaseAuthService],
    }).compile();

    controller = module.get<FirebaseAuthController>(FirebaseAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
