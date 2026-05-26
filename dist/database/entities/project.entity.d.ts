import { User } from './user.entity';
import { Segment } from './segment.entity';
export declare enum ProjectStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class Project {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    finalVideoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    segments: Segment[];
}
