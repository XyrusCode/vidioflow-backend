import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Project } from '../../database/entities/project.entity';
export interface AutomationResult {
    videoPath: string;
    duration: number;
}
export declare class AutomationService {
    private readonly stepRepo;
    private readonly projectRepo;
    private readonly configService;
    private readonly logger;
    constructor(stepRepo: Repository<AutomationStep>, projectRepo: Repository<Project>, configService: ConfigService);
    executeProjectAutomation(projectId: string): Promise<AutomationResult>;
    private executeStep;
    private ensureDir;
    private findLatestVideoFile;
}
