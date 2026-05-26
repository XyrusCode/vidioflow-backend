import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratorService } from './generator.service';
import { AutomationModule } from '../automation/automation.module';
import { TtsModule } from '../tts/tts.module';
import { Project } from '../../database/entities/project.entity';
import { Script } from '../../database/entities/script.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Script]),
    AutomationModule,
    TtsModule,
  ],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}
