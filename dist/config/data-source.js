"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const user_entity_1 = require("../database/entities/user.entity");
const project_entity_1 = require("../database/entities/project.entity");
const segment_entity_1 = require("../database/entities/segment.entity");
const project_action_entity_1 = require("../database/entities/project-action.entity");
dotenv.config({ path: '.env.local' });
dotenv.config();
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
const entities = [user_entity_1.User, project_entity_1.Project, segment_entity_1.Segment, project_action_entity_1.ProjectAction];
exports.AppDataSource = databaseUrl
    ? new typeorm_1.DataSource({
        type: 'postgres',
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities,
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    })
    : new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'vidioflow',
        entities,
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    });
exports.default = exports.AppDataSource;
//# sourceMappingURL=data-source.js.map