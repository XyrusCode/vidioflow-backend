import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { GeneratorModule } from '../generator/generator.module';
import { Project } from '../../database/entities/project.entity';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Script } from '../../database/entities/script.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, AutomationStep, Script]),
    GeneratorModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
