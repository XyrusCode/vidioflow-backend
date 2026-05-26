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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../database/entities/user.entity");
const SALT_ROUNDS = 12;
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.userRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = this.userRepo.create({
            email: dto.email.toLowerCase(),
            passwordHash,
            name: dto.name ?? null,
        });
        await this.userRepo.save(user);
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.userRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    async getMe(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return { id: user.id, email: user.email, name: user.name };
    }
    buildAuthResponse(user) {
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return {
            token,
            user: { id: user.id, email: user.email, name: user.name },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map