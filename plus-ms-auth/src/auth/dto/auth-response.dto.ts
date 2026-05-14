import { ApiProperty } from '@nestjs/swagger';

/**
 * Retorno de POST /auth/login e POST /auth/refresh.
 */
export class TokensResponseDto {
  @ApiProperty({
    description: 'JWT Access Token (validade: 15min)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT Refresh Token (validade: 7d)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...',
  })
  refresh_token: string;
}

/**
 * Retorno de POST /auth/logout.
 */
export class LogoutResponseDto {
  @ApiProperty({ example: 'Logout realizado com sucesso' })
  message: string;
}

/**
 * Payload do usuário injetado em `req.user` pela JwtStrategy.
 * Aparece como sub-objeto nas respostas de introspect e admin-only.
 */
export class JwtUserDto {
  @ApiProperty({
    description: 'ID do usuário (sub do JWT)',
    example: 'b8b3f3e4-1d2c-4d5e-9f6a-7c8d9e0f1a2b',
  })
  userId: string;

  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  @ApiProperty({
    example: 'vendedor',
    enum: ['admin', 'gestor', 'vendedor'],
  })
  role: string;
}

/**
 * Retorno de GET /auth/introspect.
 */
export class IntrospectResponseDto {
  @ApiProperty({ example: true, description: 'Indica que o token é válido' })
  active: boolean;

  @ApiProperty({ type: JwtUserDto })
  user: JwtUserDto;
}

/**
 * Retorno de GET /auth/admin-only.
 */
export class AdminOnlyResponseDto {
  @ApiProperty({ example: 'Acesso liberado! Você tem poderes de chefia.' })
  message: string;

  @ApiProperty({ type: JwtUserDto })
  user: JwtUserDto;
}