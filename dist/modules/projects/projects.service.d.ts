import { Repository, DataSource } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Script } from '../../database/entities/script.entity';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';
export declare class ProjectsService {
    private readonly projectRepo;
    private readonly stepRepo;
    private readonly scriptRepo;
    private readonly dataSource;
    private readonly logger;
    constructor(projectRepo: Repository<Project>, stepRepo: Repository<AutomationStep>, scriptRepo: Repository<Script>, dataSource: DataSource);
    findAll(): Promise<ProjectResponseDto[]>;
    create(dto: CreateProjectDto): Promise<ProjectResponseDto>;
    findOne(projectId: string): Promise<ProjectResponseDto>;
    assertGeneratable(projectId: string): Promise<void>;
}
