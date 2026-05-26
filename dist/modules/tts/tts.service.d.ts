import { ConfigService } from '@nestjs/config';
export interface TtsResult {
    audioPath: string;
    durationMs: number;
}
export declare class TtsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    synthesiseSegment(narratorText: string, voiceModel: string, projectId: string, segmentId: string): Promise<TtsResult>;
    private streamToFile;
    private probeDuration;
    private ensureDir;
}
