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
const segment_entity_1 = require("../../database/entities/segment.entity");
const project_action_entity_1 = require("../../database/entities/project-action.entity");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    constructor(projectRepo, dataSource) {
        this.projectRepo = projectRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    toDto(project) {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            finalVideoUrl: project.finalVideoUrl,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            segments: (project.segments ?? [])
                .sort((a, b) => a.segmentOrder - b.segmentOrder)
                .map((seg) => ({
                id: seg.id,
                segmentOrder: seg.segmentOrder,
                narratorText: seg.narratorText,
                voiceModel: seg.voiceModel,
                actions: (seg.actions ?? [])
                    .sort((a, b) => a.actionOrder - b.actionOrder)
                    .map((act) => ({
                    id: act.id,
                    actionOrder: act.actionOrder,
                    actionType: act.actionType,
                    selector: act.selector,
                    value: act.value,
                })),
            })),
        };
    }
    async findAll(userId) {
        const projects = await this.projectRepo.find({
            where: { userId },
            relations: ['segments', 'segments.actions'],
            order: { createdAt: 'DESC' },
        });
        return projects.map((p) => this.toDto(p));
    }
    async create(dto, userId) {
        return this.dataSource.transaction(async (manager) => {
            const project = manager.create(project_entity_1.Project, {
                userId,
                name: dto.name,
                description: dto.description ?? null,
                status: project_entity_1.ProjectStatus.PENDING,
            });
            const saved = await manager.save(project);
            for (let i = 0; i < dto.segments.length; i++) {
                const seg = dto.segments[i];
                const segment = manager.create(segment_entity_1.Segment, {
                    projectId: saved.id,
                    segmentOrder: i,
                    narratorText: seg.narratorText,
                    voiceModel: seg.voiceModel ?? 'en-US-AriaNeural',
                });
                const savedSeg = await manager.save(segment);
                const actions = seg.actions.map((a) => manager.create(project_action_entity_1.ProjectAction, {
                    segmentId: savedSeg.id,
                    actionOrder: a.actionOrder,
                    actionType: a.actionType,
                    selector: a.selector ?? null,
                    value: a.value ?? null,
                }));
                if (actions.length)
                    await manager.save(actions);
            }
            this.logger.log(`Created project ${saved.id} for user ${userId}`);
            return this.findOne(saved.id, userId);
        });
    }
    async findOne(projectId, userId) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['segments', 'segments.actions'],
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        if (project.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.toDto(project);
    }
    async assertGeneratable(projectId, userId) {
        const project = await this.projectRepo.findOne({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        if (project.userId !== userId)
            throw new common_1.ForbiddenException();
        if (project.status === project_entity_1.ProjectStatus.PROCESSING)
            throw new common_1.ConflictException(`Project ${projectId} is already processing`);
    }
    async updateStatus(projectId, status, finalVideoUrl) {
        await this.projectRepo.update(projectId, {
            status,
            ...(finalVideoUrl ? { finalVideoUrl } : {}),
        });
    }
    async findForPipeline(projectId) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['segments', 'segments.actions'],
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${projectId} not found`);
        return project;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map