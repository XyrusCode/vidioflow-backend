import { Repository, DataSource } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';
export declare class ProjectsService {
    private readonly projectRepo;
    private readonly dataSource;
    private readonly logger;
    constructor(projectRepo: Repository<Project>, dataSource: DataSource);
    private toDto;
    findAll(userId: string): Promise<ProjectResponseDto[]>;
    create(dto: CreateProjectDto, userId: string): Promise<ProjectResponseDto>;
    findOne(projectId: string, userId: string): Promise<ProjectResponseDto>;
    assertGeneratable(projectId: string, userId: string): Promise<void>;
    updateStatus(projectId: string, status: ProjectStatus, finalVideoUrl?: string): Promise<void>;
    findForPipeline(projectId: string): Promise<Project>;
}
