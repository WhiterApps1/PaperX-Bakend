import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';
import 'dotenv/config';

interface PackageJson {
  name?: string;
}

async function bootstrap() {
  // ---------------- FIREBASE INIT ----------------

  // if (!admin.apps.length) {
  //   admin.initializeApp({
  //     credential: admin.credential.cert({
  //       projectId: process.env.FIREBASE_PROJECT_ID,
  //       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  //       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  //     }),
  //     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  //   });

  //   console.log(
  //     'Firebase initialized for project:',
  //     admin.app().options.projectId,
  //   );
  // }

  // ---------------- NEST APP ----------------

  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ---------------- SWAGGER ----------------

  const config = new DocumentBuilder()
    .setTitle(getProjectName())
    .setDescription('PaperX Backend API Documentation.')
    .setVersion('1.0.0')

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste Firebase JWT token here',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (c, m) => `${c}_${m}`,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ---------------- CORS ----------------

  app.enableCors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ---------------- START ----------------

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}

void bootstrap().catch((err) => {
  console.error('Application bootstrap failed', err);
  process.exit(1);
});

// ---------------- HELPERS ----------------

function getProjectName(): string {
  const packageJsonPath = join(process.cwd(), 'package.json');

  const file = readFileSync(packageJsonPath, {
    encoding: 'utf-8',
  });

  const parsed = JSON.parse(file) as PackageJson;

  return parsed.name ?? 'Application';
}
