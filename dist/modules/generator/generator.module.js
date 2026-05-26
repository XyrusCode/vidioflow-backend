"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorModule = void 0;
const common_1 = require("@nestjs/common");
const generator_service_1 = require("./generator.service");
const automation_module_1 = require("../automation/automation.module");
const tts_module_1 = require("../tts/tts.module");
const projects_module_1 = require("../projects/projects.module");
let GeneratorModule = class GeneratorModule {
};
exports.GeneratorModule = GeneratorModule;
exports.GeneratorModule = GeneratorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            automation_module_1.AutomationModule,
            tts_module_1.TtsModule,
            (0, common_1.forwardRef)(() => projects_module_1.ProjectsModule),
        ],
        providers: [generator_service_1.GeneratorService],
        exports: [generator_service_1.GeneratorService],
    })
], GeneratorModule);
//# sourceMappingURL=generator.module.js.map