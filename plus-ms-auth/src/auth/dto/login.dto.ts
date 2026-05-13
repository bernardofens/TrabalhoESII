/*
 * plus-ms-auth/src/auth/dto/login.dto.ts
 *
 * DTO (Data Transfer Object) para a requisição de login.
 *
 * Papel na arquitetura:
 *   Define e documenta o contrato de entrada do endpoint POST /auth/login.
 *   @ApiProperty() gera a documentação no Swagger automaticamente, incluindo
 *   exemplos que facilitam testes manuais na UI /api/docs.
 *
 * Trade-off — sem class-validator aqui:
 *   Não há @IsEmail() ou @IsNotEmpty() porque class-validator não está
 *   configurado com ValidationPipe global. Validação extra ficaria no serviço.
 */

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;
}