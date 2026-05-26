import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Project } from '../../database/entities/project.entity';
import { ActionType } from '../../common/enums/action-type.enum';

export interface AutomationResult {
  videoPath: string;
  duration: number;
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectRepository(AutomationStep)
    private readonly stepRepo: Repository<AutomationStep>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly configService: ConfigService,
  ) {}

  async executeProjectAutomation(projectId: string): Promise<AutomationResult> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const steps = await this.stepRepo.find({
      where: { projectId },
      order: { stepOrder: 'ASC' },
    });

    const videoDir = this.configService.get<string>('paths.video', '/tmp/videos');
    this.ensureDir(videoDir);

    const videoPath = path.join(videoDir, `${projectId}.webm`);

    let browser: Browser | null = null;
    let context: BrowserContext | null = null;

    const startTime = Date.now();

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: videoDir!,
          size: { width: 1920, height: 1080 },
        },
      });

      const page = await context.newPage();

      for (const step of steps) {
        await this.executeStep(page, step);
      }

      // Allow final frame to settle before closing
      await page.waitForTimeout(500);

      await context.close();
      await browser.close();

      const duration = (Date.now() - startTime) / 1000;

      // Playwright names the video file based on page order; find the latest .webm
      const recordedFile = this.findLatestVideoFile(videoDir!, projectId);
      this.logger.log(`Automation complete for project ${projectId} — video at ${recordedFile}`);

      return { videoPath: recordedFile, duration };
    } catch (err) {
      this.logger.error(`Automation failed for project ${projectId}: ${err.message}`, err.stack);
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
      throw err;
    }
  }

  private async executeStep(page: Page, step: AutomationStep): Promise<void> {
    this.logger.debug(`Executing step ${step.stepOrder}: ${step.actionType}`);

    switch (step.actionType) {
      case ActionType.NAVIGATE:
        await page.goto(step.value, { waitUntil: 'networkidle', timeout: 30_000 });
        break;

      case ActionType.CLICK:
        await page.waitForSelector(step.selector, { timeout: 15_000, state: 'visible' });
        await page.click(step.selector);
        break;

      case ActionType.FILL:
        await page.waitForSelector(step.selector, { timeout: 15_000, state: 'visible' });
        await page.fill(step.selector, step.value ?? '');
        break;

      case ActionType.WAIT:
        const ms = parseInt(step.value, 10);
        if (!isNaN(ms) && ms > 0) {
          await page.waitForTimeout(ms);
        } else if (step.selector) {
          await page.waitForSelector(step.selector, { timeout: 30_000, state: 'visible' });
        }
        break;

      default:
        this.logger.warn(`Unknown action type: ${step.actionType} — skipping`);
    }
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private findLatestVideoFile(dir: string, projectId: string): string {
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
}
