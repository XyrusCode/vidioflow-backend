import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Validation is handled per-route via ZodValidationPipe.
  // No global ValidationPipe — all body validation is explicit and Zod-driven.

  app.enableCors(buildCorsOptions());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`Walker backend running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
