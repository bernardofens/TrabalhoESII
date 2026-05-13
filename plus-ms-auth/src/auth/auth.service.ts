/*
 * plus-ms-auth/src/auth/auth.service.ts
 *
 * Serviço de autenticação — contém toda a lógica de negócio de login, logout e refresh.
 *
 * Papel na arquitetura:
 *   Camada de serviço que isola a lógica de autenticação do transporte HTTP.
 *   Depende de UsersService (acesso ao banco), JwtService (geração de tokens)
 *   e ConfigService (leitura do JWT_SECRET do ambiente).
 *
 * Padrão de segurança implementado:
 *   - Dual-token: access_token de vida curta (15min) + refresh_token de vida longa (7d).
 *   - O refresh_token é hasheado com bcrypt antes de ser salvo no banco, assim
 *     um vazamento do banco não expõe tokens válidos.
 *   - Token Rotation: cada refresh gera novos tokens e invalida o anterior.
 */

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

  /*
   * Gera o par access_token + refresh_token para um usuário.
   *
   * Executa as duas assinaturas em paralelo (Promise.all) para reduzir latência,
   * já que são operações independentes de CPU (bcrypt interno do JWT).
   *
   * O payload inclui sub (padrão JWT para subject/userId), email e role.
   * Role no payload permite que o API Gateway faça autorização sem consultar o banco.
   */
  private async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const secret = this.configService.get<string>('JWT_SECRET') || 'fallback_secreto';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret, expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { secret, expiresIn: '7d' }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /*
   * Autentica o usuário com email e senha.
   *
   * Fluxo: busca usuário → compara senha com bcrypt → gera tokens → persiste refresh_token.
   * Lança UnauthorizedException com mensagem genérica ("Credenciais inválidas") tanto
   * para usuário não encontrado quanto para senha errada — evita enumerar usuários válidos.
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    // bcrypt.compare compara a senha em texto plano com o hash armazenado.
    // Nunca armazenamos a senha original — apenas o hash produzido no cadastro.
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    // Persiste o refresh_token hasheado para permitir validação futura e revogação.
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  /*
   * Invalida a sessão do usuário removendo o refresh_token do banco.
   *
   * Após o logout, tentativas de usar o refresh_token falham porque não há hash
   * para comparar. O access_token ainda é válido até expirar (15min) — trade-off
   * aceito em favor da arquitetura stateless; para revogação imediata seria
   * necessário uma blocklist (ex: Redis).
   */
  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { message: 'Logout realizado com sucesso' };
  }

  /*
   * Renova o par de tokens usando o refresh_token atual (Token Rotation).
   *
   * Fluxo: busca usuário → verifica hash do refresh_token → gera novos tokens →
   * persiste novo refresh_token (o anterior é implicitamente invalidado pela sobrescrita).
   *
   * ForbiddenException (403) em vez de Unauthorized (401) pois o usuário está
   * autenticado (JWT válido no header) mas não autorizado a usar aquele refresh_token.
   */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acesso negado');
    }

    // Compara o refresh_token recebido com o hash salvo no banco.
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Acesso negado');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }
}