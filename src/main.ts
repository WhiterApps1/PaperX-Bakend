import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { json, urlencoded } from 'express';
// import { QueryFailedFilter } from './common/filters/query-failed.filter';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { EntityNotFoundFilter } from './common/filters/entity-not-found.filter';
// import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

interface PackageJson {
  name?: string;
}

async function bootstrap() {
  console.log('ENV USER:', process.env.DB_USER);
  console.log('ENV PASS:', process.env.DB_PASSWORD);

  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // app.useGlobalFilters(
  //   new EntityNotFoundFilter(), // Catches TypeORM EntityNotFoundError -> 404
  //   new QueryFailedFilter(), // Catches TypeORM QueryFailedError (e.g., 23505 unique) -> 409
  //   new HttpExceptionFilter(), // Catches all standard NestJS HttpExceptions (including ValidationPipe's BadRequestException));//Exception filter registred
  //   new AllExceptionsFilter(), // 4. CATCH-ALL: Catches everything else (uncaught runtime errors) -> 500
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
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

  // Enable CORS
  app.enableCors({
    // origin: ['http://0.0.0.0','*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap().catch((err) => {
  console.error('Application bootstrap failed', err);
  process.exit(1);
});

function getProjectName(): string {
  const packageJsonPath = join(process.cwd(), 'package.json');

  const file = readFileSync(packageJsonPath, {
    encoding: 'utf-8',
  });

  const parsed = JSON.parse(file) as PackageJson;

  return parsed.name ?? 'Application';
}
