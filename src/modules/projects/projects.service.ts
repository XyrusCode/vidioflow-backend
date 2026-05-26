import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import { Segment } from '../../database/entities/segment.entity';
import { ProjectAction } from '../../database/entities/project-action.entity';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  private toDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      finalVideoUrl: project.finalVideoUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      segments: (project.segments ?? [])
        .sort((a, b) => a.segmentOrder - b.segmentOrder)
        .map((seg) => ({
          id: seg.id,
          segmentOrder: seg.segmentOrder,
          narratorText: seg.narratorText,
          voiceModel: seg.voiceModel,
          actions: (seg.actions ?? [])
            .sort((a, b) => a.actionOrder - b.actionOrder)
            .map((act) => ({
              id: act.id,
              actionOrder: act.actionOrder,
              actionType: act.actionType,
              selector: act.selector,
              value: act.value,
            })),
        })),
    };
  }

  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepo.find({
      where: { userId },
      relations: ['segments', 'segments.actions'],
      order: { createdAt: 'DESC' },
    });
    return projects.map((p) => this.toDto(p));
  }

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        userId,
        name: dto.name,
        description: dto.description ?? null,
        status: ProjectStatus.PENDING,
      });
      const saved = await manager.save(project);

      for (let i = 0; i < dto.segments.length; i++) {
        const seg = dto.segments[i];
        const segment = manager.create(Segment, {
          projectId: saved.id,
          segmentOrder: i,
          narratorText: seg.narratorText,
          voiceModel: seg.voiceModel ?? 'en-US-AriaNeural',
        });
        const savedSeg = await manager.save(segment);

        const actions = seg.actions.map((a) =>
          manager.create(ProjectAction, {
            segmentId: savedSeg.id,
            actionOrder: a.actionOrder,
            actionType: a.actionType,
            selector: a.selector ?? null,
            value: a.value ?? null,
          }),
        );
        if (actions.length) await manager.save(actions);
      }

      this.logger.log(`Created project ${saved.id} for user ${userId}`);
      return this.findOne(saved.id, userId);
    });
  }

  async findOne(projectId: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['segments', 'segments.actions'],
    });

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    if (project.userId !== userId) throw new ForbiddenException();

    return this.toDto(project);
  }

  async assertGeneratable(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    if (project.userId !== userId) throw new ForbiddenException();
    if (project.status === ProjectStatus.PROCESSING)
      throw new ConflictException(`Project ${projectId} is already processing`);
  }

  async updateStatus(
    projectId: string,
    status: ProjectStatus,
    finalVideoUrl?: string,
  ): Promise<void> {
    await this.projectRepo.update(projectId, {
      status,
      ...(finalVideoUrl ? { finalVideoUrl } : {}),
    });
  }

  /** Load project with full segment+actions relations for the pipeline. */
  async findForPipeline(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['segments', 'segments.actions'],
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }
}
