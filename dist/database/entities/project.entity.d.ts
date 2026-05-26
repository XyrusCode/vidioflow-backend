import { ProjectStatus } from '../../common/enums/project-status.enum';
import { AutomationStep } from './automation-step.entity';
import { Script } from './script.entity';
export declare class Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: ProjectStatus;
    finalVideoUrl: string;
    steps: AutomationStep[];
    script: Script;
}
