"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const express = require("express");
const app_module_1 = require("./app.module");
const server = express();
let initialised = false;
async function bootstrap() {
    if (initialised)
        return server;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), {
        logger: ['error', 'warn'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
        : ['http://localhost:5173', 'http://localhost:3001'];
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (allowedOrigins.includes('*') ||
                allowedOrigins.some((o) => origin === o) ||
                origin.endsWith('.vercel.app')) {
                cb(null, true);
            }
            else {
                cb(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: false,
    });
    await app.init();
    initialised = true;
    return server;
}
async function handler(req, res) {
    const app = await bootstrap();
    app(req, res);
}
exports.default = handler;
module.exports = handler;
//# sourceMappingURL=main.vercel.js.map