import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// playwright is imported lazily inside record() so ncc does not inline it at
// bundle initialisation time — which would crash the Lambda because browser
// binaries are absent in Vercel's sandbox.
import type { Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { Segment } from '../../database/entities/segment.entity';
import { ProjectAction, ActionType } from '../../database/entities/project-action.entity';

export interface SegmentTiming {
  segmentId: string;
  startMs: number;
  endMs: number;
}

export interface RecordResult {
  videoPath: string;
  segmentTimings: SegmentTiming[];
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Records a single browser session containing all segments in order.
   * Returns the path to the raw .webm file and per-segment timing boundaries.
   * The timings are used downstream to cut + speed-adjust each segment to
   * match its TTS narration duration (VideoGen-style sync).
   */
  async record(segments: Segment[]): Promise<RecordResult> {
    const videoDir = this.configService.get<string>('paths.video', '/tmp/videos');
    this.ensureDir(videoDir);

    let browser: Browser | null = null;
    let context: BrowserContext | null = null;

    try {
      const { chromium } = await import('playwright');
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
      const segmentTimings: SegmentTiming[] = [];

      const sortedSegments = [...segments].sort((a, b) => a.segmentOrder - b.segmentOrder);

      for (const segment of sortedSegments) {
        const segStart = Date.now() - sessionStart;
        const sortedActions = [...(segment.actions ?? [])].sort(
          (a, b) => a.actionOrder - b.actionOrder,
        );

        for (const action of sortedActions) {
          await this.executeAction(page, action);
        }

        segmentTimings.push({
          segmentId: segment.id,
          startMs: segStart,
          endMs: Date.now() - sessionStart,
        });
      }

      // Hold last frame
      await page.waitForTimeout(800);

      // Grab path before context closes
      const rawVideoPath = await page.video()?.path();
      await context.close();
      await browser.close();

      const videoPath = rawVideoPath ?? this.findLatestWebm(videoDir);
      this.logger.log(`Recording complete — ${videoPath}`);
      return { videoPath, segmentTimings };
    } catch (err) {
      this.logger.error(`Recording failed: ${(err as Error).message}`);
      if (context) await context.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
      throw err;
    }
  }

  private async executeAction(page: Page, action: ProjectAction): Promise<void> {
    this.logger.debug(`Action ${action.actionOrder}: ${action.actionType}`);

    switch (action.actionType) {
      case ActionType.NAVIGATE:
        await page.goto(action.value ?? '', { waitUntil: 'domcontentloaded', timeout: 30_000 });
        break;

      case ActionType.CLICK:
        await page.waitForSelector(action.selector!, { timeout: 15_000, state: 'visible' });
        await page.click(action.selector!);
        break;

      case ActionType.FILL:
        await page.waitForSelector(action.selector!, { timeout: 15_000, state: 'visible' });
        await page.fill(action.selector!, action.value ?? '');
        break;

      case ActionType.SELECT:
        await page.waitForSelector(action.selector!, { timeout: 15_000, state: 'visible' });
        await page.selectOption(action.selector!, action.value ?? '');
        break;

      case ActionType.WAIT: {
        const ms = parseInt(action.value ?? '1000', 10);
        await page.waitForTimeout(isNaN(ms) ? 1000 : ms);
        break;
      }

      case ActionType.SCROLL:
        if (action.selector) {
          await page.locator(action.selector).scrollIntoViewIfNeeded({ timeout: 10_000 });
        } else {
          const parts = (action.value ?? '0,300').split(',').map(Number);
          const scrollY = parts[1] ?? parts[0] ?? 300;
          const scrollX = parts.length > 1 ? parts[0] : 0;
          await page.evaluate(
            ({ x, y }) => window.scrollBy(x, y),
            { x: scrollX, y: scrollY },
          );
        }
        break;

      case ActionType.HOVER:
        await page.waitForSelector(action.selector!, { timeout: 15_000, state: 'visible' });
        await page.hover(action.selector!);
        break;

      case ActionType.PRESS:
        await page.keyboard.press(action.value ?? 'Enter');
        break;

      case ActionType.WAIT_FOR_SELECTOR: {
        const state = (action.value as 'attached' | 'detached' | 'visible' | 'hidden') ?? 'visible';
        await page.waitForSelector(action.selector!, { state, timeout: 30_000 });
        break;
      }

      default:
        this.logger.warn(`Unknown action type: ${action.actionType} — skipping`);
    }
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  private findLatestWebm(dir: string): string {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.webm'))
      .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    if (!files.length) throw new Error(`No .webm file found in ${dir}`);
    return path.join(dir, files[0].f);
  }
}
