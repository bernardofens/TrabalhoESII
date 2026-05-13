import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Função auxiliar para gerar os dois tokens
  private async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    // Falha o uso se JWT_SECRET não estiver configurado — sem fallback hardcoded.
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret, expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { secret, expiresIn: '7d' }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { message: 'Logout realizado com sucesso' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acesso negado');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Acesso negado');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }
}
