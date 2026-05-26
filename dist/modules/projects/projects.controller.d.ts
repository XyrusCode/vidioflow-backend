import { ProjectsService } from './projects.service';
import { GeneratorService } from '../generator/generator.service';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';
export declare class ProjectsController {
    private readonly projectsService;
    private readonly generatorService;
    private readonly logger;
    constructor(projectsService: ProjectsService, generatorService: GeneratorService);
    listProjects(): Promise<ProjectResponseDto[]>;
    createProject(dto: CreateProjectDto): Promise<ProjectResponseDto>;
    getProject(id: string): Promise<ProjectResponseDto>;
    generateVideo(id: string): Promise<{
        message: string;
        projectId: string;
    }>;
}
