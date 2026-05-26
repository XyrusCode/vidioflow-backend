"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const configuration_1 = require("./config/configuration");
const project_entity_1 = require("./database/entities/project.entity");
const automation_step_entity_1 = require("./database/entities/automation-step.entity");
const script_entity_1 = require("./database/entities/script.entity");
const projects_module_1 = require("./modules/projects/projects.module");
const automation_module_1 = require("./modules/automation/automation.module");
const tts_module_1 = require("./modules/tts/tts.module");
const generator_module_1 = require("./modules/generator/generator.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.database'),
                    entities: [project_entity_1.Project, automation_step_entity_1.AutomationStep, script_entity_1.Script],
                    synchronize: config.get('nodeEnv') !== 'production',
                    logging: config.get('nodeEnv') === 'development',
                    autoLoadEntities: true,
                }),
                inject: [config_1.ConfigService],
            }),
            projects_module_1.ProjectsModule,
            automation_module_1.AutomationModule,
            tts_module_1.TtsModule,
            generator_module_1.GeneratorModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map