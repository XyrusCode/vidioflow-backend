import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../database/entities/user.entity';
import { Project } from '../database/entities/project.entity';
import { Segment } from '../database/entities/segment.entity';
import { ProjectAction } from '../database/entities/project-action.entity';

dotenv.config({ path: '.env.local' });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
const entities = [User, Project, Segment, ProjectAction];

export const AppDataSource = databaseUrl
  ? new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
      entities,
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
      database: process.env.DB_DATABASE || 'walker',
      entities,
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    });

export default AppDataSource;
