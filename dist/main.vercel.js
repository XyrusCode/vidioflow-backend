"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const express = require("express");
const app_module_1 = require("./app.module");
const cors_config_1 = require("./config/cors.config");
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
    app.enableCors((0, cors_config_1.buildCorsOptions)());
    await app.init();
    initialised = true;
    return server;
}
async function handler(req, res) {
    try {
        const app = await bootstrap();
        app(req, res);
    }
    catch (err) {
        const message = err instanceof Error ? err.stack ?? err.message : String(err);
        console.error('[Walker bootstrap error]', message);
        res.status(500).json({ error: 'Bootstrap failed', detail: message });
    }
}
exports.default = handler;
module.exports = handler;
//# sourceMappingURL=main.vercel.js.map