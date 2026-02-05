import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExtractJwt } from 'passport-jwt';
import { FirebaseAdminModule } from '@alpha018/nestjs-firebase-auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import 'dotenv/config';
import { FirebaseAuthModule } from './firebase_auth/firebase_auth.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT!, 10),
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_DATABASE,
    //   entities: [],
    //   synchronize: process.env.RUN_MIGRATIONS === 'true',
    //   autoLoadEntities: true,
    //   logging: true, // Useful for debugging
    // }),

    // ---------------- CONFIG ----------------

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ---------------- FIREBASE AUTH ----------------

    FirebaseAdminModule.forRootAsync({
      imports: [ConfigModule],

      useFactory: (configService: ConfigService) => ({
        auth: {
          config: {
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
            checkRevoked: true,
            ignoreEmailVerification: true,
            validateRole: true,

            // useLocalRoles: false,
            // rolesClaimKey: 'user_roles',
          },
        },
      }),

      inject: [ConfigService],
    }),

    // ---------------- MODULES ----------------
    FirebaseAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
