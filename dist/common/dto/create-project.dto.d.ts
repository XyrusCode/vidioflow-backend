import { ActionType } from '../enums/action-type.enum';
export declare class CreateAutomationStepDto {
    stepOrder: number;
    actionType: ActionType;
    selector?: string;
    value?: string;
}
export declare class CreateScriptDto {
    textContent: string;
    voiceModel?: string;
}
export declare class CreateProjectDto {
    name: string;
    description?: string;
    script: CreateScriptDto;
    steps: CreateAutomationStepDto[];
}
