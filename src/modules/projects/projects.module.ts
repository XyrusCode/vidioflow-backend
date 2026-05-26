import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { GeneratorModule } from '../generator/generator.module';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), GeneratorModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
