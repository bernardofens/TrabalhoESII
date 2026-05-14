import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { RefreshDto } from './dto/refresh.dto';
import {
  TokensResponseDto,
  LogoutResponseDto,
  IntrospectResponseDto,
  AdminOnlyResponseDto,
} from './dto/auth-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Faz o login e retorna o token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna access e refresh tokens.',
    type: TokensResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação no body (email ou senha mal formados).',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas (e-mail não existe ou senha incorreta).',
    type: ErrorResponseDto,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoga o token atual (Logout)' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso (refresh token invalidado no banco).',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Access token ausente, inválido ou expirado.',
    type: ErrorResponseDto,
  })
  logout(@Request() req) {
    // req.user.userId vem da JwtStrategy que valida o Access Token
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera novos tokens usando o Refresh Token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso.',
    type: TokensResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'refresh_token ausente ou inválido no body.',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Access token ausente, inválido ou expirado.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh token não corresponde ao usuário (logout, rotacionado ou forjado).',
    type: ErrorResponseDto,
  })
  refreshTokens(@Request() req, @Body() refreshDto: RefreshDto) {
    return this.authService.refreshTokens(req.user.userId, refreshDto.refresh_token);
  }

  // --- NOVAS ROTAS PROTEGIDAS ABAIXO ---

  @UseGuards(AuthGuard('jwt')) // Exige token válido
  @ApiBearerAuth() // Avisa o Swagger que precisa do cadeado
  @Get('introspect')
  @ApiOperation({ summary: 'Valida o token JWT (Usado pelo AWS API Gateway)' })
  @ApiResponse({
    status: 200,
    description: 'Token válido. Retorna os dados do usuário extraídos do JWT.',
    type: IntrospectResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
    type: ErrorResponseDto,
  })
  introspect(@Request() req) {
    // Se o código chegou aqui, o token é 100% válido. O API Gateway ficará feliz!
    return { active: true, user: req.user };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard) // Exige token E verifica Role
  @SetMetadata('roles', ['admin', 'gestor']) // Apenas admin e gestor entram
  @ApiBearerAuth()
  @Get('admin-only')
  @ApiOperation({ summary: 'Rota de teste RBAC (Apenas Admin/Gestor)' })
  @ApiResponse({
    status: 200,
    description: 'Acesso liberado: usuário possui role admin ou gestor.',
    type: AdminOnlyResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado, mas sem role admin/gestor.',
    type: ErrorResponseDto,
  })
  testRbac(@Request() req) {
    return { message: 'Acesso liberado! Você tem poderes de chefia.', user: req.user };
  }
}