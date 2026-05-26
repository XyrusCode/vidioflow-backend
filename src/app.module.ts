import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { Project } from './database/entities/project.entity';
import { AutomationStep } from './database/entities/automation-step.entity';
import { Script } from './database/entities/script.entity';
import { ProjectsModule } from './modules/projects/projects.module';
import { AutomationModule } from './modules/automation/automation.module';
import { TtsModule } from './modules/tts/tts.module';
import { GeneratorModule } from './modules/generator/generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [Project, AutomationStep, Script],
        synchronize: config.get<string>('nodeEnv') !== 'production',
        logging: config.get<string>('nodeEnv') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ProjectsModule,
    AutomationModule,
    TtsModule,
    GeneratorModule,
  ],
})
export class AppModule {}
