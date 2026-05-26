import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Project } from '../../database/entities/project.entity';
import { Script } from '../../database/entities/script.entity';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { AutomationService } from '../automation/automation.service';
import { TtsService } from '../tts/tts.service';

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Script)
    private readonly scriptRepo: Repository<Script>,
    private readonly automationService: AutomationService,
    private readonly ttsService: TtsService,
    private readonly configService: ConfigService,
  ) {}

  async generateVideo(projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (project.status === ProjectStatus.PROCESSING) {
      this.logger.warn(`Project ${projectId} is already processing — ignoring duplicate trigger`);
      return;
    }

    await this.setStatus(projectId, ProjectStatus.PROCESSING);

    // Fire-and-forget the async pipeline; caller gets immediate 202
    this.runPipeline(projectId).catch((err) => {
      this.logger.error(`Pipeline failed for ${projectId}: ${err.message}`, err.stack);
    });
  }

  private async runPipeline(projectId: string): Promise<void> {
    try {
      const script = await this.scriptRepo.findOne({ where: { projectId } });
      if (!script) {
        throw new NotFoundException(`Script not found for project ${projectId}`);
      }

      this.logger.log(`[${projectId}] Step 1/3 — Running Playwright automation`);
      const [automationResult, ttsResult] = await Promise.all([
        this.automationService.executeProjectAutomation(projectId),
        this.ttsService.synthesize(script.textContent, script.voiceModel, projectId),
      ]);

      this.logger.log(`[${projectId}] Step 2/3 — Merging video + audio with FFmpeg`);
      const outputPath = await this.mergeWithFfmpeg(
        automationResult.videoPath,
        ttsResult.audioPath,
        projectId,
      );

      this.logger.log(`[${projectId}] Step 3/3 — Updating project status`);
      await this.projectRepo.update(projectId, {
        status: ProjectStatus.COMPLETED,
        finalVideoUrl: outputPath,
      });

      this.logger.log(`[${projectId}] Pipeline complete — output at ${outputPath}`);
    } catch (err) {
      await this.setStatus(projectId, ProjectStatus.FAILED);
      throw err;
    }
  }

  private async mergeWithFfmpeg(
    videoPath: string,
    audioPath: string,
    projectId: string,
  ): Promise<string> {
    const outputDir = this.configService.get<string>('paths.output', '/tmp/output');
    const ffmpegBin = this.configService.get<string>('ffmpeg', 'ffmpeg');
    this.ensureDir(outputDir!);

    const outputPath = path.join(outputDir!, `${projectId}.mp4`);

    return new Promise((resolve, reject) => {
      /**
       * FFmpeg command breakdown:
       *  -i videoPath        — input 0: the recorded .webm screen capture
       *  -i audioPath        — input 1: the TTS .mp3 audio
       *  -map 0:v:0          — take video stream from input 0
       *  -map 1:a:0          — take audio stream from input 1
       *  -c:v libx264        — re-encode video to H.264 for web compatibility
       *  -preset fast        — balance speed vs compression
       *  -crf 23             — constant rate factor (quality; lower = better)
       *  -c:a aac            — encode audio as AAC
       *  -b:a 192k           — audio bitrate
       *  -shortest           — trim to the shorter of the two streams
       *  -movflags +faststart — relocate moov atom for streaming
       *  -y                  — overwrite output without prompt
       */
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

      const ffmpegProcess: ChildProcess = spawn(ffmpegBin!, args, { stdio: ['ignore', 'ignore', 'pipe'] });

      const stderr: string[] = [];
      ffmpegProcess.stderr!.on('data', (chunk: Buffer) => {
        stderr.push(chunk.toString());
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(
            new Error(
              `FFmpeg exited with code ${code}.\n${stderr.slice(-10).join('')}`,
            ),
          );
        }
      });

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
      });
    });
  }

  private async setStatus(projectId: string, status: ProjectStatus): Promise<void> {
    await this.projectRepo.update(projectId, { status });
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
