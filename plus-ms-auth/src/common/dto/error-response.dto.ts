import { ApiProperty } from '@nestjs/swagger';

/**
 * Formato padrão de erro do NestJS para exceções HTTP simples
 * (Unauthorized, Forbidden, Conflict, NotFound, etc.)
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Credenciais inválidas' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

/**
 * Formato de erro retornado pelo ValidationPipe global
 * (main.ts: whitelist + forbidNonWhitelisted + transform).
 * O `message` aqui é um array com todas as falhas do class-validator.
 */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: [
      'E-mail inválido',
      'A senha deve ter no mínimo 6 caracteres',
    ],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}