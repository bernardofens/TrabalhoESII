/*
 * plus-ms-auth/src/users/dto/create-user.dto.ts
 *
 * DTO para criação de usuário — define o contrato de entrada do POST /users.
 *
 * Papel na arquitetura:
 *   Separa o objeto de transferência de dados da entidade de banco.
 *   O campo `password` existe aqui mas NÃO existe na entidade User (que tem
 *   `passwordHash`). Essa separação evita que a senha em texto plano
 *   chegue por acidente ao repositório ou apareça em logs.
 *
 * Nota sobre role:
 *   Aceitar role no DTO de criação é conveniente para criar admins via API,
 *   mas em produção esse campo deveria ser restrito a usuários autenticados
 *   com permissão de admin.
 */

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  // Recebido em texto plano; o UsersService faz o hash com bcrypt antes de persistir.
  @ApiProperty({ example: 'senha123' })
  password: string;

  @ApiProperty({ example: 'vendedor', required: false, description: 'Pode ser admin, gestor ou vendedor' })
  role?: string;
}