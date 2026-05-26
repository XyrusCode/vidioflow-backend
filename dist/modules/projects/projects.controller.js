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
var ProjectsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const projects_service_1 = require("./projects.service");
const generator_service_1 = require("../generator/generator.service");
const create_project_dto_1 = require("../../common/dto/create-project.dto");
let ProjectsController = ProjectsController_1 = class ProjectsController {
    constructor(projectsService, generatorService) {
        this.projectsService = projectsService;
        this.generatorService = generatorService;
        this.logger = new common_1.Logger(ProjectsController_1.name);
    }
    listProjects(req) {
        return this.projectsService.findAll(req.user.id);
    }
    createProject(dto, req) {
        return this.projectsService.create(dto, req.user.id);
    }
    getProject(id, req) {
        return this.projectsService.findOne(id, req.user.id);
    }
    async generateVideo(id, req) {
        await this.projectsService.assertGeneratable(id, req.user.id);
        void this.generatorService.generateVideo(id);
        return { message: 'Video generation started', projectId: id };
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listProjects", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProject", null);
__decorate([
    (0, common_1.Post)(':id/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "generateVideo", null);
exports.ProjectsController = ProjectsController = ProjectsController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        generator_service_1.GeneratorService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map