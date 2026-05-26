import { ConfigService } from '@nestjs/config';
export interface TtsResult {
    audioPath: string;
}
export declare class TtsService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    synthesize(textContent: string, voiceModel: string, projectId: string): Promise<TtsResult>;
    private streamToFile;
    private ensureDir;
}
