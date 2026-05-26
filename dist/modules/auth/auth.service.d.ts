import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
    }>;
    private buildAuthResponse;
}
