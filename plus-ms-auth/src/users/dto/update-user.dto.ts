/*
 * plus-ms-auth/src/users/dto/update-user.dto.ts
 *
 * DTO para atualização parcial de usuário.
 *
 * Papel na arquitetura:
 *   Herda todos os campos de CreateUserDto mas os torna opcionais via PartialType,
 *   permitindo PATCH semântico (atualizar apenas os campos enviados).
 *
 * Escolha de design — PartialType do @nestjs/swagger:
 *   Usar PartialType em vez de redefinir os campos manualmente evita duplicação
 *   e mantém a documentação Swagger sincronizada automaticamente. Trade-off:
 *   acoplamento ao CreateUserDto — mudanças lá refletem aqui automaticamente.
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}