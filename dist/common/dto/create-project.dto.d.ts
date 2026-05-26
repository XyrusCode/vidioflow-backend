import { ActionType } from '../../database/entities/project-action.entity';
export declare class CreateActionDto {
    actionOrder: number;
    actionType: ActionType;
    selector?: string;
    value?: string;
}
export declare class CreateSegmentDto {
    narratorText: string;
    voiceModel?: string;
    actions: CreateActionDto[];
}
export declare class CreateProjectDto {
    name: string;
    description?: string;
    segments: CreateSegmentDto[];
}
