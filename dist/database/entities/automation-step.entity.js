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
exports.AutomationStep = void 0;
const typeorm_1 = require("typeorm");
const action_type_enum_1 = require("../../common/enums/action-type.enum");
const project_entity_1 = require("./project.entity");
let AutomationStep = class AutomationStep {
};
exports.AutomationStep = AutomationStep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AutomationStep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid' }),
    __metadata("design:type", String)
], AutomationStep.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_order', type: 'int' }),
    __metadata("design:type", Number)
], AutomationStep.prototype, "stepOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'action_type',
        type: 'enum',
        enum: action_type_enum_1.ActionType,
    }),
    __metadata("design:type", String)
], AutomationStep.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], AutomationStep.prototype, "selector", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AutomationStep.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.steps, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], AutomationStep.prototype, "project", void 0);
exports.AutomationStep = AutomationStep = __decorate([
    (0, typeorm_1.Entity)('automation_steps'),
    (0, typeorm_1.Index)(['projectId', 'stepOrder'])
], AutomationStep);
//# sourceMappingURL=automation-step.entity.js.map