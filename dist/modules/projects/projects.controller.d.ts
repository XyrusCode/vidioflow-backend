import { ProjectsService } from './projects.service';
import { GeneratorService } from '../generator/generator.service';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';
interface AuthRequest {
    user: {
        id: string;
        email: string;
    };
}
export declare class ProjectsController {
    private readonly projectsService;
    private readonly generatorService;
    private readonly logger;
    constructor(projectsService: ProjectsService, generatorService: GeneratorService);
    listProjects(req: AuthRequest): Promise<ProjectResponseDto[]>;
    createProject(dto: CreateProjectDto, req: AuthRequest): Promise<ProjectResponseDto>;
    getProject(id: string, req: AuthRequest): Promise<ProjectResponseDto>;
    generateVideo(id: string, req: AuthRequest): Promise<{
        message: string;
        projectId: string;
    }>;
}
export {};
