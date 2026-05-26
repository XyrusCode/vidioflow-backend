import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export interface TtsResult {
  audioPath: string;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(private readonly configService: ConfigService) {}

  async synthesize(textContent: string, voiceModel: string, projectId: string): Promise<TtsResult> {
    const audioDir = this.configService.get<string>('paths.audio', '/tmp/audio');
    this.ensureDir(audioDir);

    const audioPath = path.join(audioDir!, `${projectId}.mp3`);

    this.logger.log(`Synthesizing TTS for project ${projectId} with voice ${voiceModel}`);

    await this.streamToFile(textContent, voiceModel, audioPath!);

    this.logger.log(`TTS audio written to ${audioPath}`);
    return { audioPath };
  }

  private async streamToFile(
    text: string,
    voice: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tts = new MsEdgeTTS();

      tts
        .setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
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

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
