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
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const playwright_1 = require("playwright");
const fs = require("fs");
const path = require("path");
const automation_step_entity_1 = require("../../database/entities/automation-step.entity");
const project_entity_1 = require("../../database/entities/project.entity");
const action_type_enum_1 = require("../../common/enums/action-type.enum");
let AutomationService = AutomationService_1 = class AutomationService {
    constructor(stepRepo, projectRepo, configService) {
        this.stepRepo = stepRepo;
        this.projectRepo = projectRepo;
        this.configService = configService;
        this.logger = new common_1.Logger(AutomationService_1.name);
    }
    async executeProjectAutomation(projectId) {
        const project = await this.projectRepo.findOne({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        }
        const steps = await this.stepRepo.find({
            where: { projectId },
            order: { stepOrder: 'ASC' },
        });
        const videoDir = this.configService.get('paths.video', '/tmp/videos');
        this.ensureDir(videoDir);
        const videoPath = path.join(videoDir, `${projectId}.webm`);
        let browser = null;
        let context = null;
        const startTime = Date.now();
        try {
            browser = await playwright_1.chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            });
            context = await browser.newContext({
                viewport: { width: 1920, height: 1080 },
                recordVideo: {
                    dir: videoDir,
                    size: { width: 1920, height: 1080 },
                },
            });
            const page = await context.newPage();
            for (const step of steps) {
                await this.executeStep(page, step);
            }
            await page.waitForTimeout(500);
            await context.close();
            await browser.close();
            const duration = (Date.now() - startTime) / 1000;
            const recordedFile = this.findLatestVideoFile(videoDir, projectId);
            this.logger.log(`Automation complete for project ${projectId} — video at ${recordedFile}`);
            return { videoPath: recordedFile, duration };
        }
        catch (err) {
            this.logger.error(`Automation failed for project ${projectId}: ${err.message}`, err.stack);
            if (context)
                await context.close().catch(() => { });
            if (browser)
                await browser.close().catch(() => { });
            throw err;
        }
    }
    async executeStep(page, step) {
        this.logger.debug(`Executing step ${step.stepOrder}: ${step.actionType}`);
        switch (step.actionType) {
            case action_type_enum_1.ActionType.NAVIGATE:
                await page.goto(step.value, { waitUntil: 'networkidle', timeout: 30_000 });
                break;
            case action_type_enum_1.ActionType.CLICK:
                await page.waitForSelector(step.selector, { timeout: 15_000, state: 'visible' });
                await page.click(step.selector);
                break;
            case action_type_enum_1.ActionType.FILL:
                await page.waitForSelector(step.selector, { timeout: 15_000, state: 'visible' });
                await page.fill(step.selector, step.value ?? '');
                break;
            case action_type_enum_1.ActionType.WAIT:
                const ms = parseInt(step.value, 10);
                if (!isNaN(ms) && ms > 0) {
                    await page.waitForTimeout(ms);
                }
                else if (step.selector) {
                    await page.waitForSelector(step.selector, { timeout: 30_000, state: 'visible' });
                }
                break;
            default:
                this.logger.warn(`Unknown action type: ${step.actionType} — skipping`);
        }
    }
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    findLatestVideoFile(dir, projectId) {
        const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.webm'))
            .map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);
        if (!files.length) {
            throw new Error(`No video file found in ${dir} after automation for project ${projectId}`);
        }
        return path.join(dir, files[0].name);
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(automation_step_entity_1.AutomationStep)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map