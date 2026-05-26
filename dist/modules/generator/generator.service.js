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
var GeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const project_entity_1 = require("../../database/entities/project.entity");
const automation_service_1 = require("../automation/automation.service");
const tts_service_1 = require("../tts/tts.service");
const projects_service_1 = require("../projects/projects.service");
let GeneratorService = GeneratorService_1 = class GeneratorService {
    constructor(automationService, ttsService, projectsService, config) {
        this.automationService = automationService;
        this.ttsService = ttsService;
        this.projectsService = projectsService;
        this.config = config;
        this.logger = new common_1.Logger(GeneratorService_1.name);
    }
    async generateVideo(projectId) {
        await this.projectsService.updateStatus(projectId, project_entity_1.ProjectStatus.PROCESSING);
        void this.runPipeline(projectId);
    }
    async runPipeline(projectId) {
        const log = (msg) => this.logger.log(`[${projectId}] ${msg}`);
        try {
            const project = await this.projectsService.findForPipeline(projectId);
            const segments = [...project.segments].sort((a, b) => a.segmentOrder - b.segmentOrder);
            if (!segments.length)
                throw new Error('Project has no segments');
            log('Step 1/4 — Recording browser session');
            const { videoPath, segmentTimings } = await this.automationService.record(segments);
            log('Step 2/4 — Synthesising narration');
            const audioResults = await Promise.all(segments.map((seg) => this.ttsService.synthesiseSegment(seg.narratorText, seg.voiceModel, projectId, seg.id)));
            log('Step 3/4 — Processing segments');
            const segmentPaths = [];
            for (let i = 0; i < segments.length; i++) {
                const timing = segmentTimings.find((t) => t.segmentId === segments[i].id);
                if (!timing)
                    throw new Error(`Missing timing for segment ${segments[i].id}`);
                const segPath = await this.processSegment(videoPath, timing, audioResults[i], projectId, segments[i].id, i);
                segmentPaths.push(segPath);
            }
            log('Step 4/4 — Concatenating segments');
            const finalPath = await this.concatenate(segmentPaths, projectId);
            await this.projectsService.updateStatus(projectId, project_entity_1.ProjectStatus.COMPLETED, finalPath);
            log(`Done — ${finalPath}`);
        }
        catch (err) {
            this.logger.error(`Pipeline failed for ${projectId}: ${err.message}`);
            await this.projectsService.updateStatus(projectId, project_entity_1.ProjectStatus.FAILED);
        }
    }
    async processSegment(videoPath, timing, audio, projectId, segmentId, index) {
        const segDir = path.join(this.config.get('paths.output', '/tmp/output'), 'segments', projectId);
        this.ensureDir(segDir);
        const outputPath = path.join(segDir, `seg_${String(index).padStart(3, '0')}.mp4`);
        const startSec = timing.startMs / 1000;
        const videoSec = Math.max((timing.endMs - timing.startMs) / 1000, 0.1);
        const audioSec = Math.max(audio.durationMs / 1000, 0.1);
        const pts = (audioSec / videoSec).toFixed(6);
        const args = [
            '-ss', startSec.toFixed(3),
            '-t', videoSec.toFixed(3),
            '-i', videoPath,
            '-i', audio.audioPath,
            '-filter:v', `setpts=${pts}*PTS`,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
            '-c:a', 'aac', '-b:a', '128k',
            '-shortest',
            '-y',
            outputPath,
        ];
        await this.ffmpeg(args);
        return outputPath;
    }
    async concatenate(segPaths, projectId) {
        const outDir = this.config.get('paths.output', '/tmp/output');
        this.ensureDir(outDir);
        const listPath = path.join(outDir, `${projectId}_concat.txt`);
        await fsp.writeFile(listPath, segPaths.map((p) => `file '${p}'`).join('\n'));
        const outputPath = path.join(outDir, `${projectId}.mp4`);
        await this.ffmpeg([
            '-f', 'concat', '-safe', '0',
            '-i', listPath,
            '-c', 'copy',
            '-movflags', '+faststart',
            '-y',
            outputPath,
        ]);
        return outputPath;
    }
    ffmpeg(args) {
        const bin = this.config.get('ffmpeg', 'ffmpeg');
        return new Promise((resolve, reject) => {
            const proc = (0, child_process_1.spawn)(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
            const stderr = [];
            proc.stderr.on('data', (c) => stderr.push(c.toString()));
            proc.on('close', (code) => {
                if (code === 0)
                    resolve();
                else
                    reject(new Error(`FFmpeg exit ${code}\n${stderr.slice(-5).join('')}`));
            });
            proc.on('error', (e) => reject(new Error(`spawn ffmpeg: ${e.message}`)));
        });
    }
    ensureDir(dir) {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = GeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [automation_service_1.AutomationService,
        tts_service_1.TtsService,
        projects_service_1.ProjectsService,
        config_1.ConfigService])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map