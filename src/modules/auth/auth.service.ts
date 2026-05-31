import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from './email.service';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly resetSecret: string;
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {
    const jwtSecret = config.get<string>('jwtSecret', 'dev-secret-change-in-production');
    this.resetSecret = `${jwtSecret}-reset`;
    this.frontendUrl = config.get<string>('frontendUrl', 'http://localhost:5173');
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
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

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name };
  }

  /**
   * Sends a password-reset email if the address exists.
   * Always returns the same message to prevent email enumeration.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, email: user.email, purpose: 'password-reset' },
        { secret: this.resetSecret, expiresIn: '1h' },
      );
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
      await this.emailService.sendPasswordReset(user.email, resetUrl);
    }

    return {
      message:
        "If an account exists with that email, you'll receive a reset link shortly.",
    };
  }

  /**
   * Validates the reset JWT and updates the user's password.
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    let payload: { sub: string; purpose?: string };
    try {
      payload = this.jwtService.verify(token, { secret: this.resetSecret });
    } catch {
      throw new BadRequestException(
        'This reset link is invalid or has expired. Please request a new one.',
      );
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Invalid reset token.');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.userRepo.update(user.id, { passwordHash });

    return { message: 'Password updated successfully. You can now sign in.' };
  }

  private buildAuthResponse(user: User) {
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
