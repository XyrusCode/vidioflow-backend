import { Project } from './project.entity';
export declare class Script {
    id: string;
    projectId: string;
    textContent: string;
    voiceModel: string;
    project: Project;
}
