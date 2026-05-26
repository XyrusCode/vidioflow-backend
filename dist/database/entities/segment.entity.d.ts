import { Project } from './project.entity';
import { ProjectAction } from './project-action.entity';
export declare class Segment {
    id: string;
    projectId: string;
    segmentOrder: number;
    narratorText: string;
    voiceModel: string;
    project: Project;
    actions: ProjectAction[];
}
