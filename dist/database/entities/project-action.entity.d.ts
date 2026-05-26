import { Segment } from './segment.entity';
export declare enum ActionType {
    NAVIGATE = "navigate",
    CLICK = "click",
    FILL = "fill",
    SELECT = "select",
    WAIT = "wait",
    SCROLL = "scroll",
    HOVER = "hover",
    PRESS = "press",
    WAIT_FOR_SELECTOR = "waitForSelector"
}
export declare class ProjectAction {
    id: string;
    segmentId: string;
    actionOrder: number;
    actionType: ActionType;
    selector: string | null;
    value: string | null;
    segment: Segment;
}
