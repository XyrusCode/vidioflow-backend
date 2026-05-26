"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../../database/entities/project.entity");
const automation_step_entity_1 = require("../../database/entities/automation-step.entity");
const script_entity_1 = require("../../database/entities/script.entity");
const project_status_enum_1 = require("../../common/enums/project-status.enum");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    constructor(projectRepo, stepRepo, scriptRepo, dataSource) {
        this.projectRepo = projectRepo;
        this.stepRepo = stepRepo;
        this.scriptRepo = scriptRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    async findAll() {
        const projects = await this.projectRepo.find({
            relations: ['script', 'steps'],
            order: { createdAt: 'DESC' },
        });
        return projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            finalVideoUrl: project.finalVideoUrl,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            script: project.script
                ? {
                    id: project.script.id,
                    textContent: project.script.textContent,
                    voiceModel: project.script.voiceModel,
                }
                : null,
            steps: (project.steps ?? [])
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((s) => ({
                id: s.id,
                stepOrder: s.stepOrder,
                actionType: s.actionType,
                selector: s.selector,
                value: s.value,
            })),
        }));
    }
    async create(dto) {
        return this.dataSource.transaction(async (manager) => {
            const project = manager.create(project_entity_1.Project, {
                name: dto.name,
                description: dto.description ?? undefined,
                status: project_status_enum_1.ProjectStatus.PENDING,
            });
            const savedProject = await manager.save(project);
            const script = manager.create(script_entity_1.Script, {
                projectId: savedProject.id,
                textContent: dto.script.textContent,
                voiceModel: dto.script.voiceModel ?? 'en-US-AriaNeural',
            });
            await manager.save(script);
            const steps = dto.steps.map((s) => manager.create(automation_step_entity_1.AutomationStep, {
                projectId: savedProject.id,
                stepOrder: s.stepOrder,
                actionType: s.actionType,
                selector: s.selector ?? undefined,
                value: s.value ?? undefined,
            }));
            await manager.save(steps);
            this.logger.log(`Created project ${savedProject.id} with ${steps.length} steps`);
            return this.findOne(savedProject.id);
        });
    }
    async findOne(projectId) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['script', 'steps'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        }
        const sortedSteps = (project.steps ?? []).sort((a, b) => a.stepOrder - b.stepOrder);
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            finalVideoUrl: project.finalVideoUrl,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            script: project.script
                ? {
                    id: project.script.id,
                    textContent: project.script.textContent,
                    voiceModel: project.script.voiceModel,
                }
                : null,
            steps: sortedSteps.map((s) => ({
                id: s.id,
                stepOrder: s.stepOrder,
                actionType: s.actionType,
                selector: s.selector,
                value: s.value,
            })),
        };
    }
    async assertGeneratable(projectId) {
        const project = await this.projectRepo.findOne({ where: { id: projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        }
        if (project.status === project_status_enum_1.ProjectStatus.PROCESSING) {
            throw new common_1.ConflictException(`Project ${projectId} is already being processed`);
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(automation_step_entity_1.AutomationStep)),
    __param(2, (0, typeorm_1.InjectRepository)(script_entity_1.Script)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map