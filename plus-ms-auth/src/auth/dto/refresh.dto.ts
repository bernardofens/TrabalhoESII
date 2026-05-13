/*
 * plus-ms-auth/src/auth/dto/refresh.dto.ts
 *
 * DTO para a requisição de renovação de tokens.
 *
 * Papel na arquitetura:
 *   Define o corpo esperado pelo endpoint POST /auth/refresh.
 *   O refresh_token vem no body (e não no header) porque é um dado de longa duração
 *   que o cliente armazena separadamente do access_token. O access_token vai no header
 *   para identificar o usuário (via JwtStrategy); o refresh_token vai no body para ser
 *   validado contra o hash no banco.
 */

import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'O Refresh Token recebido no login' })
  refresh_token: string;
}