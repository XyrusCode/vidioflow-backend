/**
 * Walker — shared CORS configuration
 *
 * Used by both main.ts (local dev) and main.vercel.ts (serverless).
 * A single function to keep the allow-list in one place.
 *
 * Allowed by default (no env var needed):
 *   • localhost:5173, localhost:3001   — local Vite dev servers
 *   • *.vercel.app                     — all Vercel preview + production URLs
 *   • *.lovable.app                    — all Lovable preview + production URLs
 *
 * Add any extra origins via CORS_ORIGINS env var (comma-separated):
 *   CORS_ORIGINS=https://myapp.com,https://staging.myapp.com
 */
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/** Trusted hostname suffixes — any subdomain of these is allowed. */
const TRUSTED_SUFFIXES = ['.vercel.app', '.lovable.app'];

/** Hard-coded origins always allowed regardless of env. */
const ALWAYS_ALLOWED = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function buildCorsOptions(): CorsOptions {
  // Extra origins injected at runtime via env
  const envOrigins: string[] = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const allowAll = envOrigins.includes('*');

  return {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      // No origin header — internal / same-origin / curl / Postman
      if (!origin) return cb(null, true);

      if (allowAll) return cb(null, true);

      const allowed =
        ALWAYS_ALLOWED.includes(origin) ||
        envOrigins.includes(origin) ||
        TRUSTED_SUFFIXES.some((suffix) => origin.endsWith(suffix));

      if (allowed) {
        cb(null, true);
      } else {
        // Log the blocked origin so it's easy to diagnose and add
        console.warn(`[CORS] blocked origin: ${origin}`);
        cb(new Error(`CORS: origin not allowed — ${origin}`));
      }
    },
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['X-Request-Id'],
    credentials: false,
    // Cache preflight for 24 h to avoid repeated OPTIONS round-trips
    maxAge: 86400,
  };
}
