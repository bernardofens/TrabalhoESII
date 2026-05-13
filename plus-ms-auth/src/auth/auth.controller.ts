/*
 * plus-ms-auth/src/auth/auth.controller.ts
 *
 * Controller HTTP do módulo de autenticação — expõe os endpoints públicos e protegidos.
 *
 * Papel na arquitetura:
 *   Roteia requisições HTTP para AuthService. Aplica guards de autenticação (JWT)
 *   e autorização (RBAC via RolesGuard). Segue o padrão thin-controller: sem lógica
 *   de negócio aqui, apenas validação de entrada e delegação ao serviço.
 *
 * Endpoints:
 *   POST /auth/login       — público, retorna access_token + refresh_token
 *   POST /auth/logout      — protegido por JWT, invalida o refresh_token no banco
 *   POST /auth/refresh     — protegido por JWT, rotaciona os tokens
 *   GET  /auth/introspect  — protegido por JWT, usado pelo API Gateway para validar tokens
 *   GET  /auth/admin-only  — protegido por JWT + RBAC (admin/gestor)
 */

import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
   * POST /auth/login — autenticação de usuário.
   *
   * HttpCode(OK) sobrescreve o padrão 201 do @Post, pois login não cria recurso.
   * Retorna access_token (15min) e refresh_token (7d) para o cliente armazenar.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Faz o login e retorna o token JWT' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /*
   * POST /auth/logout — invalida a sessão do usuário.
   *
   * Requer JWT válido para identificar qual refresh_token remover do banco.
   * Logout stateless "puro" apenas descartaria o token no cliente, mas isso
   * deixaria o refresh_token ativo. Armazenar e invalidar no banco garante
   * revogação real da sessão.
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoga o token atual (Logout)' })
  logout(@Request() req) {
    // req.user é populado pela JwtStrategy após validar o Bearer token.
    return this.authService.logout(req.user.userId);
  }

  /*
   * POST /auth/refresh — rotação de tokens (Token Rotation Pattern).
   *
   * Recebe o refresh_token no body e o access_token no header (para identificar o usuário).
   * Gera novos access_token e refresh_token, invalidando o refresh_token anterior.
   * Trade-off: usar o access_token para identificar o usuário significa que ele ainda
   * precisa ser válido — usuários com access_token expirado devem fazer login novamente.
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera novos tokens usando o Refresh Token' })
  refreshTokens(@Request() req, @Body() refreshDto: RefreshDto) {
    return this.authService.refreshTokens(req.user.userId, refreshDto.refresh_token);
  }

  /*
   * GET /auth/introspect — endpoint de validação de token para o API Gateway.
   *
   * Se a requisição chegou aqui, o AuthGuard('jwt') já validou o token.
   * Retorna { active: true, user } que o API Gateway usa para autorizar downstream.
   * Padrão OAuth2 Token Introspection (RFC 7662) simplificado.
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('introspect')
  @ApiOperation({ summary: 'Valida o token JWT (Usado pelo AWS API Gateway)' })
  introspect(@Request() req) {
    return { active: true, user: req.user };
  }

  /*
   * GET /auth/admin-only — endpoint de teste de RBAC (Role-Based Access Control).
   *
   * Encadeia dois guards: AuthGuard valida o JWT, RolesGuard verifica se
   * user.role está na lista definida por @SetMetadata.
   * @SetMetadata é uma forma direta de anexar metadados à rota; em sistemas
   * maiores convém criar um decorator @Roles() para evitar strings hardcoded.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['admin', 'gestor'])
  @ApiBearerAuth()
  @Get('admin-only')
  @ApiOperation({ summary: 'Rota de teste RBAC (Apenas Admin/Gestor)' })
  testRbac(@Request() req) {
    return { message: 'Acesso liberado! Você tem poderes de chefia.', user: req.user };
  }
}