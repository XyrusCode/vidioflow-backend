"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const project_entity_1 = require("../database/entities/project.entity");
const automation_step_entity_1 = require("../database/entities/automation-step.entity");
const script_entity_1 = require("../database/entities/script.entity");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'vidioflow',
    entities: [project_entity_1.Project, automation_step_entity_1.AutomationStep, script_entity_1.Script],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=data-source.js.map