import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Project } from '../database/entities/project.entity';
import { AutomationStep } from '../database/entities/automation-step.entity';
import { Script } from '../database/entities/script.entity';

dotenv.config({ path: '.env.local' });
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;

export const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
      entities: [Project, AutomationStep, Script],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'vidioflow',
      entities: [Project, AutomationStep, Script],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    });

export default AppDataSource;
