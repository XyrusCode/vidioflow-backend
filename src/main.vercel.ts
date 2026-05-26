/**
 * Vercel serverless entrypoint.
 * Wraps the NestJS app in an Express adapter and exports a handler function
 * that Vercel's @vercel/node runtime can invoke per-request.
 */
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from './app.module';
import type { Request, Response } from 'express';

const server = express();
let initialised = false;

async function bootstrap() {
  if (initialised) return server;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,DELETE,OPTIONS' });

  await app.init();
  initialised = true;
  return server;
}

// Vercel calls this function for every request.
// module.exports is used directly so the CJS output is compatible with
// both @vercel/node ncc bundling and the newer nodejs runtime.
async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  app(req, res);
}

export default handler;
module.exports = handler;
