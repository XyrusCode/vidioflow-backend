/**
 * Vercel serverless entrypoint.
 * Wraps the NestJS app in an Express adapter and exports a handler function
 * that Vercel's @vercel/node runtime can invoke per-request.
 */
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors.config';
import type { Request, Response } from 'express';

const server = express();

// Promise-based single-flight guard: concurrent cold-start requests all await
// the same promise instead of each attempting to bootstrap independently.
let initPromise: Promise<express.Express> | null = null;

function bootstrap(): Promise<express.Express> {
  if (!initPromise) {
    initPromise = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: ['error', 'warn'],
      });

      // Validation is handled per-route via ZodValidationPipe.
      // No global ValidationPipe — all body validation is explicit and Zod-driven.

      app.enableCors(buildCorsOptions());

      await app.init();
      return server;
    })();
  }
  return initPromise;
}

// Vercel calls this function for every request.
async function handler(req: Request, res: Response) {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    console.error('[Walker bootstrap error]', message);
    res.status(500).json({ error: 'Bootstrap failed', detail: message });
  }
}

export default handler;
module.exports = handler;
