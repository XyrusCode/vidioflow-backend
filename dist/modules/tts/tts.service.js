"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const msedge_tts_1 = require("msedge-tts");
let TtsService = TtsService_1 = class TtsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TtsService_1.name);
    }
    async synthesize(textContent, voiceModel, projectId) {
        const audioDir = this.configService.get('paths.audio', '/tmp/audio');
        this.ensureDir(audioDir);
        const audioPath = path.join(audioDir, `${projectId}.mp3`);
        this.logger.log(`Synthesizing TTS for project ${projectId} with voice ${voiceModel}`);
        await this.streamToFile(textContent, voiceModel, audioPath);
        this.logger.log(`TTS audio written to ${audioPath}`);
        return { audioPath };
    }
    async streamToFile(text, voice, outputPath) {
        return new Promise((resolve, reject) => {
            const tts = new msedge_tts_1.MsEdgeTTS();
            tts
                .setMetadata(voice, msedge_tts_1.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
                .then(() => {
                const readable = tts.toStream(text);
                const writeStream = fs.createWriteStream(outputPath);
                readable.on('error', (err) => {
                    writeStream.destroy();
                    reject(new Error(`TTS stream error: ${err.message}`));
                });
                writeStream.on('error', (err) => {
                    reject(new Error(`Audio write error: ${err.message}`));
                });
                writeStream.on('finish', resolve);
                readable.pipe(writeStream);
            })
                .catch(reject);
        });
    }
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
};
exports.TtsService = TtsService;
exports.TtsService = TtsService = TtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TtsService);
//# sourceMappingURL=tts.service.js.map