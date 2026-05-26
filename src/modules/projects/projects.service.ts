import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Script } from '../../database/entities/script.entity';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';
import { ProjectStatus } from '../../common/enums/project-status.enum';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(AutomationStep)
    private readonly stepRepo: Repository<AutomationStep>,
    @InjectRepository(Script)
    private readonly scriptRepo: Repository<Script>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepo.find({
      relations: ['script', 'steps'],
      order: { createdAt: 'DESC' },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      finalVideoUrl: project.finalVideoUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      script: project.script
        ? {
            id: project.script.id,
            textContent: project.script.textContent,
            voiceModel: project.script.voiceModel,
          }
        : null,
      steps: (project.steps ?? [])
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((s) => ({
          id: s.id,
          stepOrder: s.stepOrder,
          actionType: s.actionType,
          selector: s.selector,
          value: s.value,
        })),
    }));
  }

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        name: dto.name,
        description: dto.description ?? undefined,
        status: ProjectStatus.PENDING,
      } as any);
      const savedProject = await manager.save(project);

      const script = manager.create(Script, {
        projectId: savedProject.id,
        textContent: dto.script.textContent,
        voiceModel: dto.script.voiceModel ?? 'en-US-AriaNeural',
      });
      await manager.save(script);

      const steps = dto.steps.map((s) =>
        manager.create(AutomationStep, {
          projectId: savedProject.id,
          stepOrder: s.stepOrder,
          actionType: s.actionType,
          selector: s.selector ?? undefined,
          value: s.value ?? undefined,
        } as any),
      );
      await manager.save(steps);

      this.logger.log(`Created project ${savedProject.id} with ${steps.length} steps`);

      return this.findOne(savedProject.id);
    });
  }

  async findOne(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['script', 'steps'],
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const sortedSteps = (project.steps ?? []).sort((a, b) => a.stepOrder - b.stepOrder);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      finalVideoUrl: project.finalVideoUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      script: project.script
        ? {
            id: project.script.id,
            textContent: project.script.textContent,
            voiceModel: project.script.voiceModel,
          }
        : null,
      steps: sortedSteps.map((s) => ({
        id: s.id,
        stepOrder: s.stepOrder,
        actionType: s.actionType,
        selector: s.selector,
        value: s.value,
      })),
    };
  }

  async assertGeneratable(projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    if (project.status === ProjectStatus.PROCESSING) {
      throw new ConflictException(`Project ${projectId} is already being processed`);
    }
  }
}
