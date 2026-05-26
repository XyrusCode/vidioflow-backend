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
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { GeneratorService } from '../generator/generator.service';
import { CreateProjectDto } from '../../common/dto/create-project.dto';
import { ProjectResponseDto } from '../../common/dto/project-response.dto';

interface AuthRequest {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly generatorService: GeneratorService,
  ) {}

  @Get()
  listProjects(@Request() req: AuthRequest): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProject(
    @Body() dto: CreateProjectDto,
    @Request() req: AuthRequest,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get(':id')
  getProject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req: AuthRequest,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Post(':id/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateVideo(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req: AuthRequest,
  ): Promise<{ message: string; projectId: string }> {
    await this.projectsService.assertGeneratable(id, req.user.id);
    void this.generatorService.generateVideo(id);
    return { message: 'Video generation started', projectId: id };
  }
}
