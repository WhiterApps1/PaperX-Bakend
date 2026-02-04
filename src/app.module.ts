import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExtractJwt } from 'passport-jwt';
import { FirebaseAdminModule } from '@alpha018/nestjs-firebase-auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import 'dotenv/config';

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

    // Firebase Authentication setup
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseAdminModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        auth: {
          config: {
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the header
            checkRevoked: true, // Optionally check if the token is revoked
            ignoreEmailVerification: true,
            validateRole: true, // Enable role validation if needed
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
