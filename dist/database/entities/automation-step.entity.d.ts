import { ActionType } from '../../common/enums/action-type.enum';
import { Project } from './project.entity';
export declare class AutomationStep {
    id: string;
    projectId: string;
    stepOrder: number;
    actionType: ActionType;
    selector: string;
    value: string;
    project: Project;
}
