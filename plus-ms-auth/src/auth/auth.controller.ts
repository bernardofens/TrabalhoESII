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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Faz o login e retorna o token JWT' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoga o token atual (Logout)' })
  logout(@Request() req) {
    // req.user.userId vem da JwtStrategy que valida o Access Token
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera novos tokens usando o Refresh Token' })
  refreshTokens(@Request() req, @Body() refreshDto: RefreshDto) {
    return this.authService.refreshTokens(req.user.userId, refreshDto.refresh_token);
  }

  // --- NOVAS ROTAS PROTEGIDAS ABAIXO ---

  @UseGuards(AuthGuard('jwt')) // Exige token válido
  @ApiBearerAuth() // Avisa o Swagger que precisa do cadeado
  @Get('introspect')
  @ApiOperation({ summary: 'Valida o token JWT (Usado pelo AWS API Gateway)' })
  introspect(@Request() req) {
    // Se o código chegou aqui, o token é 100% válido. O API Gateway ficará feliz!
    return { active: true, user: req.user };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard) // Exige token E verifica Role
  @SetMetadata('roles', ['admin', 'gestor']) // Apenas admin e gestor entram
  @ApiBearerAuth()
  @Get('admin-only')
  @ApiOperation({ summary: 'Rota de teste RBAC (Apenas Admin/Gestor)' })
  testRbac(@Request() req) {
    return { message: 'Acesso liberado! Você tem poderes de chefia.', user: req.user };
  }
}