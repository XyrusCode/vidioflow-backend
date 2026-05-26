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
exports.ProjectAction = exports.ActionType = void 0;
const typeorm_1 = require("typeorm");
const segment_entity_1 = require("./segment.entity");
var ActionType;
(function (ActionType) {
    ActionType["NAVIGATE"] = "navigate";
    ActionType["CLICK"] = "click";
    ActionType["FILL"] = "fill";
    ActionType["SELECT"] = "select";
    ActionType["WAIT"] = "wait";
    ActionType["SCROLL"] = "scroll";
    ActionType["HOVER"] = "hover";
    ActionType["PRESS"] = "press";
    ActionType["WAIT_FOR_SELECTOR"] = "waitForSelector";
})(ActionType || (exports.ActionType = ActionType = {}));
let ProjectAction = class ProjectAction {
};
exports.ProjectAction = ProjectAction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectAction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ProjectAction.prototype, "segmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ProjectAction.prototype, "actionOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ActionType }),
    __metadata("design:type", String)
], ProjectAction.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], ProjectAction.prototype, "selector", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ProjectAction.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => segment_entity_1.Segment, (segment) => segment.actions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'segmentId' }),
    __metadata("design:type", segment_entity_1.Segment)
], ProjectAction.prototype, "segment", void 0);
exports.ProjectAction = ProjectAction = __decorate([
    (0, typeorm_1.Entity)('project_actions'),
    (0, typeorm_1.Index)(['segmentId', 'actionOrder'])
], ProjectAction);
//# sourceMappingURL=project-action.entity.js.map