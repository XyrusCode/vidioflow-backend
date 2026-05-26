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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const project_entity_1 = require("../../database/entities/project.entity");
const script_entity_1 = require("../../database/entities/script.entity");
const project_status_enum_1 = require("../../common/enums/project-status.enum");
const automation_service_1 = require("../automation/automation.service");
const tts_service_1 = require("../tts/tts.service");
let GeneratorService = GeneratorService_1 = class GeneratorService {
    constructor(projectRepo, scriptRepo, automationService, ttsService, configService) {
        this.projectRepo = projectRepo;
        this.scriptRepo = scriptRepo;
        this.automationService = automationService;
        this.ttsService = ttsService;
        this.configService = configService;
        this.logger = new common_1.Logger(GeneratorService_1.name);
    }
    async generateVideo(projectId) {
        const project = await this.projectRepo.findOne({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        }
        if (project.status === project_status_enum_1.ProjectStatus.PROCESSING) {
            this.logger.warn(`Project ${projectId} is already processing — ignoring duplicate trigger`);
            return;
        }
        await this.setStatus(projectId, project_status_enum_1.ProjectStatus.PROCESSING);
        this.runPipeline(projectId).catch((err) => {
            this.logger.error(`Pipeline failed for ${projectId}: ${err.message}`, err.stack);
        });
    }
    async runPipeline(projectId) {
        try {
            const script = await this.scriptRepo.findOne({ where: { projectId } });
            if (!script) {
                throw new common_1.NotFoundException(`Script not found for project ${projectId}`);
            }
            this.logger.log(`[${projectId}] Step 1/3 — Running Playwright automation`);
            const [automationResult, ttsResult] = await Promise.all([
                this.automationService.executeProjectAutomation(projectId),
                this.ttsService.synthesize(script.textContent, script.voiceModel, projectId),
            ]);
            this.logger.log(`[${projectId}] Step 2/3 — Merging video + audio with FFmpeg`);
            const outputPath = await this.mergeWithFfmpeg(automationResult.videoPath, ttsResult.audioPath, projectId);
            this.logger.log(`[${projectId}] Step 3/3 — Updating project status`);
            await this.projectRepo.update(projectId, {
                status: project_status_enum_1.ProjectStatus.COMPLETED,
                finalVideoUrl: outputPath,
            });
            this.logger.log(`[${projectId}] Pipeline complete — output at ${outputPath}`);
        }
        catch (err) {
            await this.setStatus(projectId, project_status_enum_1.ProjectStatus.FAILED);
            throw err;
        }
    }
    async mergeWithFfmpeg(videoPath, audioPath, projectId) {
        const outputDir = this.configService.get('paths.output', '/tmp/output');
        const ffmpegBin = this.configService.get('ffmpeg', 'ffmpeg');
        this.ensureDir(outputDir);
        const outputPath = path.join(outputDir, `${projectId}.mp4`);
        return new Promise((resolve, reject) => {
            const args = [
                '-i', videoPath,
                '-i', audioPath,
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                '-movflags', '+faststart',
                '-y',
                outputPath,
            ];
            this.logger.debug(`FFmpeg args: ${args.join(' ')}`);
            const ffmpegProcess = (0, child_process_1.spawn)(ffmpegBin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
            const stderr = [];
            ffmpegProcess.stderr.on('data', (chunk) => {
                stderr.push(chunk.toString());
            });
            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(outputPath);
                }
                else {
                    reject(new Error(`FFmpeg exited with code ${code}.\n${stderr.slice(-10).join('')}`));
                }
            });
            ffmpegProcess.on('error', (err) => {
                reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
            });
        });
    }
    async setStatus(projectId, status) {
        await this.projectRepo.update(projectId, { status });
    }
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = GeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(script_entity_1.Script)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        automation_service_1.AutomationService,
        tts_service_1.TtsService,
        config_1.ConfigService])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map