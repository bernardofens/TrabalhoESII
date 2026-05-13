/*
 * plus-ms-auth/src/users/users.controller.ts
 *
 * Controller HTTP para gerenciamento de usuários.
 *
 * Papel na arquitetura:
 *   Expõe endpoints REST para operações sobre usuários. Atualmente apenas
 *   o cadastro (POST /users) está implementado — rota pública para criação
 *   de conta. Operações de leitura e atualização são feitas internamente
 *   pelo UsersService e consumidas pelo AuthService, sem endpoints públicos.
 *
 * Nota: em produção, POST /users deveria exigir autenticação de admin para
 * evitar cadastros não autorizados. A ausência de guard aqui é intencional
 * para simplificar o fluxo de onboarding neste contexto de desenvolvimento.
 */

import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*
   * POST /users — cadastra um novo usuário no sistema.
   *
   * Delega para UsersService.create que valida unicidade do email e faz o hash
   * da senha antes de persistir. Retorna o usuário criado sem o passwordHash.
   */
  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}