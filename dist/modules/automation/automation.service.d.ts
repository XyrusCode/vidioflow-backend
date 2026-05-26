import { ConfigService } from '@nestjs/config';
import { Segment } from '../../database/entities/segment.entity';
export interface SegmentTiming {
    segmentId: string;
    startMs: number;
    endMs: number;
}
export interface RecordResult {
    videoPath: string;
    segmentTimings: SegmentTiming[];
}
export declare class AutomationService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    record(segments: Segment[]): Promise<RecordResult>;
    private executeAction;
    private ensureDir;
    private findLatestWebm;
}
