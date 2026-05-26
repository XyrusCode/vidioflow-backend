import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { GeneratorService } from '../generator/generator.service';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';

@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly generatorService: GeneratorService,
  ) {}

  @Get()
  async listProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.create(dto);
  }

  @Get(':id')
  async getProject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Post(':id/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateVideo(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string; projectId: string }> {
    await this.projectsService.assertGeneratable(id);
    await this.generatorService.generateVideo(id);

    return {
      message: 'Video generation started',
      projectId: id,
    };
  }
}
