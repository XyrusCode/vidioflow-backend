import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export interface TtsResult {
  audioPath: string;
  durationMs: number;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(private readonly configService: ConfigService) {}

  /** Synthesise TTS for a single segment and return the path + duration. */
  async synthesiseSegment(
    narratorText: string,
    voiceModel: string,
    projectId: string,
    segmentId: string,
  ): Promise<TtsResult> {
    const audioDir = this.configService.get<string>('paths.audio', '/tmp/audio');
    this.ensureDir(audioDir);

    const audioPath = path.join(audioDir, `${projectId}_${segmentId}.mp3`);

    this.logger.log(`TTS segment ${segmentId} voice=${voiceModel}`);
    await this.streamToFile(narratorText, voiceModel, audioPath);

    const durationMs = await this.probeDuration(audioPath);
    this.logger.log(`TTS done — ${audioPath} (${durationMs}ms)`);
    return { audioPath, durationMs };
  }

  private streamToFile(text: string, voice: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tts = new MsEdgeTTS();
      tts
        .setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
        .then(() => {
          const readable = tts.toStream(text);
          const writeStream = fs.createWriteStream(outputPath);
          readable.on('error', (e) => { writeStream.destroy(); reject(e); });
          writeStream.on('error', reject);
          writeStream.on('finish', resolve);
          readable.pipe(writeStream);
        })
        .catch(reject);
    });
  }

  /** Use ffprobe to get duration in milliseconds. */
  private probeDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        filePath,
      ]);
      let out = '';
      proc.stdout.on('data', (d: Buffer) => (out += d.toString()));
      proc.on('close', (code) => {
        if (code !== 0) { reject(new Error('ffprobe failed')); return; }
        try {
          const parsed = JSON.parse(out) as { format?: { duration?: string } };
          const sec = parseFloat(parsed.format?.duration ?? '0');
          resolve(Math.round(sec * 1000));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
