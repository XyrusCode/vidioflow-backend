import { ProjectStatus } from '../enums/project-status.enum';
import { ActionType } from '../enums/action-type.enum';
export declare class AutomationStepResponseDto {
    id: string;
    stepOrder: number;
    actionType: ActionType;
    selector: string | null;
    value: string | null;
}
export declare class ScriptResponseDto {
    id: string;
    textContent: string;
    voiceModel: string;
}
export declare class ProjectResponseDto {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    finalVideoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    script: ScriptResponseDto | null;
    steps: AutomationStepResponseDto[];
}
