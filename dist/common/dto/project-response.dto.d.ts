import { ProjectStatus } from '../../database/entities/project.entity';
import { ActionType } from '../../database/entities/project-action.entity';
export declare class ActionResponseDto {
    id: string;
    actionOrder: number;
    actionType: ActionType;
    selector: string | null;
    value: string | null;
}
export declare class SegmentResponseDto {
    id: string;
    segmentOrder: number;
    narratorText: string;
    voiceModel: string;
    actions: ActionResponseDto[];
}
export declare class ProjectResponseDto {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    finalVideoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    segments: SegmentResponseDto[];
}
