import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { ProjectStatus } from '../../database/entities/project.entity';
import { AutomationService, SegmentTiming } from '../automation/automation.service';
import { TtsService, TtsResult } from '../tts/tts.service';
import { ProjectsService } from '../projects/projects.service';
import { Segment } from '../../database/entities/segment.entity';

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);

  constructor(
    private readonly automationService: AutomationService,
    private readonly ttsService: TtsService,
    private readonly projectsService: ProjectsService,
    private readonly config: ConfigService,
  ) {}

  /** Called by controller — marks PROCESSING, fires pipeline, returns immediately. */
  async generateVideo(projectId: string): Promise<void> {
    await this.projectsService.updateStatus(projectId, ProjectStatus.PROCESSING);
    void this.runPipeline(projectId);
  }

  private async runPipeline(projectId: string): Promise<void> {
    const log = (msg: string) => this.logger.log(`[${projectId}] ${msg}`);

    try {
      const project = await this.projectsService.findForPipeline(projectId);
      const segments = [...project.segments].sort((a, b) => a.segmentOrder - b.segmentOrder);

      if (!segments.length) throw new Error('Project has no segments');

      // ── Step 1: Record full browser session with segment timestamps ──────
      log('Step 1/4 — Recording browser session');
      const { videoPath, segmentTimings } = await this.automationService.record(segments);

      // ── Step 2: TTS for every segment in parallel ────────────────────────
      log('Step 2/4 — Synthesising narration');
      const audioResults = await Promise.all(
        segments.map((seg) =>
          this.ttsService.synthesiseSegment(seg.narratorText, seg.voiceModel, projectId, seg.id),
        ),
      );

      // ── Step 3: Per-segment cut + speed-adjust + mux ─────────────────────
      log('Step 3/4 — Processing segments');
      const segmentPaths: string[] = [];
      for (let i = 0; i < segments.length; i++) {
        const timing = segmentTimings.find((t) => t.segmentId === segments[i].id);
        if (!timing) throw new Error(`Missing timing for segment ${segments[i].id}`);
        const segPath = await this.processSegment(
          videoPath,
          timing,
          audioResults[i],
          projectId,
          segments[i].id,
          i,
        );
        segmentPaths.push(segPath);
      }

      // ── Step 4: Concatenate segment MP4s ─────────────────────────────────
      log('Step 4/4 — Concatenating segments');
      const finalPath = await this.concatenate(segmentPaths, projectId);

      await this.projectsService.updateStatus(projectId, ProjectStatus.COMPLETED, finalPath);
      log(`Done — ${finalPath}`);
    } catch (err) {
      this.logger.error(`Pipeline failed for ${projectId}: ${(err as Error).message}`);
      await this.projectsService.updateStatus(projectId, ProjectStatus.FAILED);
    }
  }

  /**
   * Cuts the raw session video to the segment window, speed-adjusts video
   * to match TTS audio length (VideoGen-style), and muxes audio in.
   */
  private async processSegment(
    videoPath: string,
    timing: SegmentTiming,
    audio: TtsResult,
    projectId: string,
    segmentId: string,
    index: number,
  ): Promise<string> {
    const segDir = path.join(this.config.get('paths.output', '/tmp/output'), 'segments', projectId);
    this.ensureDir(segDir);

    const outputPath = path.join(segDir, `seg_${String(index).padStart(3, '0')}.mp4`);

    const startSec = timing.startMs / 1000;
    const videoSec = Math.max((timing.endMs - timing.startMs) / 1000, 0.1);
    const audioSec = Math.max(audio.durationMs / 1000, 0.1);

    // Speed ratio > 1 → slow video down to fill narration; < 1 → speed up
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

  /** Concatenate segment MP4s with the FFmpeg concat demuxer (stream copy). */
  private async concatenate(segPaths: string[], projectId: string): Promise<string> {
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

  private ffmpeg(args: string[]): Promise<void> {
    const bin = this.config.get<string>('ffmpeg', 'ffmpeg');
    return new Promise((resolve, reject) => {
      const proc = spawn(bin!, args, { stdio: ['ignore', 'ignore', 'pipe'] });
      const stderr: string[] = [];
      proc.stderr!.on('data', (c: Buffer) => stderr.push(c.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exit ${code}\n${stderr.slice(-5).join('')}`));
      });
      proc.on('error', (e) => reject(new Error(`spawn ffmpeg: ${e.message}`)));
    });
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
