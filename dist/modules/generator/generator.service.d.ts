import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Project } from '../../database/entities/project.entity';
import { Script } from '../../database/entities/script.entity';
import { AutomationService } from '../automation/automation.service';
import { TtsService } from '../tts/tts.service';
export declare class GeneratorService {
    private readonly projectRepo;
    private readonly scriptRepo;
    private readonly automationService;
    private readonly ttsService;
    private readonly configService;
    private readonly logger;
    constructor(projectRepo: Repository<Project>, scriptRepo: Repository<Script>, automationService: AutomationService, ttsService: TtsService, configService: ConfigService);
    generateVideo(projectId: string): Promise<void>;
    private runPipeline;
    private mergeWithFfmpeg;
    private setStatus;
    private ensureDir;
}
