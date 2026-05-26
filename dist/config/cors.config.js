"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCorsOptions = buildCorsOptions;
const TRUSTED_SUFFIXES = ['.vercel.app', '.lovable.app'];
const ALWAYS_ALLOWED = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
];
function buildCorsOptions() {
    const envOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : [];
    const allowAll = envOrigins.includes('*');
    return {
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (allowAll)
                return cb(null, true);
            const allowed = ALWAYS_ALLOWED.includes(origin) ||
                envOrigins.includes(origin) ||
                TRUSTED_SUFFIXES.some((suffix) => origin.endsWith(suffix));
            if (allowed) {
                cb(null, true);
            }
            else {
                console.warn(`[CORS] blocked origin: ${origin}`);
                cb(new Error(`CORS: origin not allowed — ${origin}`));
            }
        },
        methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        exposedHeaders: ['X-Request-Id'],
        credentials: false,
        maxAge: 86400,
    };
}
//# sourceMappingURL=cors.config.js.map