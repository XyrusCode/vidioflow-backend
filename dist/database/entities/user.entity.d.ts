import { Project } from './project.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string | null;
    createdAt: Date;
    projects: Project[];
}
