import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExtractJwt } from 'passport-jwt';
import { FirebaseAdminModule } from '@alpha018/nestjs-firebase-auth';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { FirebaseAuthModule } from './firebase_auth/firebase_auth.module';
import { WalletModule } from './wallet/wallet.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { ProfileModule } from './profile/profile.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [
    /* ---------------- CONFIG ---------------- */

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /* ---------------- DATABASE ---------------- */

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,

      // Only allow auto-sync in development
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),

    /* ---------------- REDIS ---------------- */

    RedisModule,

    /* ---------------- FIREBASE AUTH ---------------- */

    FirebaseAdminModule.forRootAsync({
      imports: [ConfigModule],

      useFactory: () => ({
        auth: {
          config: {
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
            checkRevoked: true,
            ignoreEmailVerification: true,
            validateRole: true,
          },
        },
      }),
    }),

    /* ---------------- MODULES ---------------- */

    FirebaseAuthModule,
    WalletModule,
    UserModule,
    PermissionModule,
    ProfileModule,
    TradingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
