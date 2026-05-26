import { Module, forwardRef } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { AutomationModule } from '../automation/automation.module';
import { TtsModule } from '../tts/tts.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    AutomationModule,
    TtsModule,
    forwardRef(() => ProjectsModule),
  ],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}
