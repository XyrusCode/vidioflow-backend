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
exports.Segment = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
const project_action_entity_1 = require("./project-action.entity");
let Segment = class Segment {
};
exports.Segment = Segment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Segment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Segment.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Segment.prototype, "segmentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Segment.prototype, "narratorText", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'en-US-AriaNeural' }),
    __metadata("design:type", String)
], Segment.prototype, "voiceModel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.segments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], Segment.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_action_entity_1.ProjectAction, (action) => action.segment, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Segment.prototype, "actions", void 0);
exports.Segment = Segment = __decorate([
    (0, typeorm_1.Entity)('segments'),
    (0, typeorm_1.Index)(['projectId', 'segmentOrder'])
], Segment);
//# sourceMappingURL=segment.entity.js.map