import { ConfigService } from '@nestjs/config';
import { AutomationService } from '../automation/automation.service';
import { TtsService } from '../tts/tts.service';
import { ProjectsService } from '../projects/projects.service';
export declare class GeneratorService {
    private readonly automationService;
    private readonly ttsService;
    private readonly projectsService;
    private readonly config;
    private readonly logger;
    constructor(automationService: AutomationService, ttsService: TtsService, projectsService: ProjectsService, config: ConfigService);
    generateVideo(projectId: string): Promise<void>;
    private runPipeline;
    private processSegment;
    private concatenate;
    private ffmpeg;
    private ensureDir;
}
