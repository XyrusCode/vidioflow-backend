import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationService } from './automation.service';
import { AutomationStep } from '../../database/entities/automation-step.entity';
import { Project } from '../../database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AutomationStep, Project])],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
