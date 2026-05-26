"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const projects_controller_1 = require("./projects.controller");
const projects_service_1 = require("./projects.service");
const generator_module_1 = require("../generator/generator.module");
const project_entity_1 = require("../../database/entities/project.entity");
const automation_step_entity_1 = require("../../database/entities/automation-step.entity");
const script_entity_1 = require("../../database/entities/script.entity");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project, automation_step_entity_1.AutomationStep, script_entity_1.Script]),
            generator_module_1.GeneratorModule,
        ],
        controllers: [projects_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map