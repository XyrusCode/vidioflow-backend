import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { User } from './database/entities/user.entity';
import { Project } from './database/entities/project.entity';
import { Segment } from './database/entities/segment.entity';
import { ProjectAction } from './database/entities/project-action.entity';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AutomationModule } from './modules/automation/automation.module';
import { TtsModule } from './modules/tts/tts.module';
import { GeneratorModule } from './modules/generator/generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url');
        const isProduction = config.get<string>('nodeEnv') === 'production';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: [User, Project, Segment, ProjectAction],
            synchronize: true,
            logging: !isProduction,
            autoLoadEntities: true,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
          entities: [User, Project, Segment, ProjectAction],
          synchronize: !isProduction,
          logging: !isProduction,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProjectsModule,
    AutomationModule,
    TtsModule,
    GeneratorModule,
  ],
})
export class AppModule {}
