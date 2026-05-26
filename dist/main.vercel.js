"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
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
    app.enableCors({ origin: '*', methods: 'GET,POST,PATCH,DELETE,OPTIONS' });
    await app.init();
    initialised = true;
    return server;
}
async function handler(req, res) {
    const app = await bootstrap();
    app(req, res);
}
//# sourceMappingURL=main.vercel.js.map