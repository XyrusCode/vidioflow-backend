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
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const project_action_entity_1 = require("../../database/entities/project-action.entity");
let AutomationService = AutomationService_1 = class AutomationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AutomationService_1.name);
    }
    async record(segments) {
        const videoDir = this.configService.get('paths.video', '/tmp/videos');
        this.ensureDir(videoDir);
        let browser = null;
        let context = null;
        try {
            const { chromium } = await Promise.resolve().then(() => require('playwright'));
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            });
            context = await browser.newContext({
                viewport: { width: 1280, height: 720 },
                recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
            });
            const page = await context.newPage();
            const sessionStart = Date.now();
            const segmentTimings = [];
            const sortedSegments = [...segments].sort((a, b) => a.segmentOrder - b.segmentOrder);
            for (const segment of sortedSegments) {
                const segStart = Date.now() - sessionStart;
                const sortedActions = [...(segment.actions ?? [])].sort((a, b) => a.actionOrder - b.actionOrder);
                for (const action of sortedActions) {
                    await this.executeAction(page, action);
                }
                segmentTimings.push({
                    segmentId: segment.id,
                    startMs: segStart,
                    endMs: Date.now() - sessionStart,
                });
            }
            await page.waitForTimeout(800);
            const rawVideoPath = await page.video()?.path();
            await context.close();
            await browser.close();
            const videoPath = rawVideoPath ?? this.findLatestWebm(videoDir);
            this.logger.log(`Recording complete — ${videoPath}`);
            return { videoPath, segmentTimings };
        }
        catch (err) {
            this.logger.error(`Recording failed: ${err.message}`);
            if (context)
                await context.close().catch(() => { });
            if (browser)
                await browser.close().catch(() => { });
            throw err;
        }
    }
    async executeAction(page, action) {
        this.logger.debug(`Action ${action.actionOrder}: ${action.actionType}`);
        switch (action.actionType) {
            case project_action_entity_1.ActionType.NAVIGATE:
                await page.goto(action.value ?? '', { waitUntil: 'domcontentloaded', timeout: 30_000 });
                break;
            case project_action_entity_1.ActionType.CLICK:
                await page.waitForSelector(action.selector, { timeout: 15_000, state: 'visible' });
                await page.click(action.selector);
                break;
            case project_action_entity_1.ActionType.FILL:
                await page.waitForSelector(action.selector, { timeout: 15_000, state: 'visible' });
                await page.fill(action.selector, action.value ?? '');
                break;
            case project_action_entity_1.ActionType.SELECT:
                await page.waitForSelector(action.selector, { timeout: 15_000, state: 'visible' });
                await page.selectOption(action.selector, action.value ?? '');
                break;
            case project_action_entity_1.ActionType.WAIT: {
                const ms = parseInt(action.value ?? '1000', 10);
                await page.waitForTimeout(isNaN(ms) ? 1000 : ms);
                break;
            }
            case project_action_entity_1.ActionType.SCROLL:
                if (action.selector) {
                    await page.locator(action.selector).scrollIntoViewIfNeeded({ timeout: 10_000 });
                }
                else {
                    const parts = (action.value ?? '0,300').split(',').map(Number);
                    const scrollY = parts[1] ?? parts[0] ?? 300;
                    const scrollX = parts.length > 1 ? parts[0] : 0;
                    await page.evaluate(({ x, y }) => window.scrollBy(x, y), { x: scrollX, y: scrollY });
                }
                break;
            case project_action_entity_1.ActionType.HOVER:
                await page.waitForSelector(action.selector, { timeout: 15_000, state: 'visible' });
                await page.hover(action.selector);
                break;
            case project_action_entity_1.ActionType.PRESS:
                await page.keyboard.press(action.value ?? 'Enter');
                break;
            case project_action_entity_1.ActionType.WAIT_FOR_SELECTOR: {
                const state = action.value ?? 'visible';
                await page.waitForSelector(action.selector, { state, timeout: 30_000 });
                break;
            }
            default:
                this.logger.warn(`Unknown action type: ${action.actionType} — skipping`);
        }
    }
    ensureDir(dir) {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
    }
    findLatestWebm(dir) {
        const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.webm'))
            .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);
        if (!files.length)
            throw new Error(`No .webm file found in ${dir}`);
        return path.join(dir, files[0].f);
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map