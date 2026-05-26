"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    database: {
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'walker',
    },
    paths: {
        video: process.env.VIDEO_OUTPUT_DIR || '/tmp/videos',
        audio: process.env.AUDIO_OUTPUT_DIR || '/tmp/audio',
        output: process.env.FINAL_OUTPUT_DIR || '/tmp/output',
    },
    ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg',
});
//# sourceMappingURL=configuration.js.map