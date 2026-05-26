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
exports.Script = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
let Script = class Script {
};
exports.Script = Script;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Script.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], Script.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'text_content', type: 'text' }),
    __metadata("design:type", String)
], Script.prototype, "textContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'voice_model', type: 'varchar', length: 100, default: 'en-US-AriaNeural' }),
    __metadata("design:type", String)
], Script.prototype, "voiceModel", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => project_entity_1.Project, (project) => project.script, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Script.prototype, "project", void 0);
exports.Script = Script = __decorate([
    (0, typeorm_1.Entity)('scripts')
], Script);
//# sourceMappingURL=script.entity.js.map