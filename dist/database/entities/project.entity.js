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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const typeorm_1 = require("typeorm");
const project_status_enum_1 = require("../../common/enums/project-status.enum");
const automation_step_entity_1 = require("./automation-step.entity");
const script_entity_1 = require("./script.entity");
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: project_status_enum_1.ProjectStatus,
        default: project_status_enum_1.ProjectStatus.PENDING,
    }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_video_url', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "finalVideoUrl", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => automation_step_entity_1.AutomationStep, (step) => step.project, {
        cascade: true,
        eager: false,
    }),
    __metadata("design:type", Array)
], Project.prototype, "steps", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => script_entity_1.Script, (script) => script.project, {
        cascade: true,
        eager: false,
    }),
    __metadata("design:type", script_entity_1.Script)
], Project.prototype, "script", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects')
], Project);
//# sourceMappingURL=project.entity.js.map