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
    const secret = this.configService.get<string>('JWT_SECRET') || 'fallback_secreto';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret, expiresIn: '15m' }), // Access Token rápido
      this.jwtService.signAsync(payload, { secret, expiresIn: '7d' }),  // Refresh Token demorado
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    // Gera os tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    
    // Salva o Refresh Token no banco
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    // Para deslogar, simplesmente apagamos o Refresh Token do banco
    await this.usersService.removeRefreshToken(userId);
    return { message: 'Logout realizado com sucesso' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acesso negado');
    }

    // Verifica se o Refresh Token enviado bate com o que está no banco
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Acesso negado');
    }

    // Se bater, gera novos tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }
}