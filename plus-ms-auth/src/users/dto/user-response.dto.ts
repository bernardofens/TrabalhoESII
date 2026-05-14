import { ApiProperty } from '@nestjs/swagger';

/**
 * Retorno de POST /users.
 *
 * Reflete exatamente o `result` do UsersService.create():
 * o usuário salvo com `passwordHash` removido via destructuring.
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'UUID do usuário',
    example: 'b8b3f3e4-1d2c-4d5e-9f6a-7c8d9e0f1a2b',
  })
  id: string;

  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  @ApiProperty({
    example: 'vendedor',
    enum: ['admin', 'gestor', 'vendedor'],
  })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Hash do refresh token (null quando o usuário está deslogado / acabou de ser criado).',
    example: null,
    nullable: true,
    type: String,
  })
  hashedRefreshToken: string | null;
}