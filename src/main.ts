import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`Vidioflow backend running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
