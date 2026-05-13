/*
 * plus-ms-auth/src/users/users.module.ts
 *
 * Módulo de gerenciamento de usuários.
 *
 * Papel na arquitetura:
 *   Registra o repositório TypeORM da entidade User e exporta UsersService
 *   para que AuthModule possa utilizá-lo sem importar o repositório diretamente.
 *   Esse encapsulamento segue o princípio de módulos coesos do NestJS.
 *
 * Escolha de design — exports: [UsersService]:
 *   Exportar o serviço (e não o repositório) mantém o banco encapsulado dentro
 *   do módulo. AuthService nunca acessa o banco diretamente — sempre via UsersService.
 *   Trade-off: uma camada extra, mas garante que mudanças no schema do User
 *   só precisem ser tratadas dentro de UsersModule.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  // forFeature registra o Repository<User> no escopo deste módulo,
  // tornando-o injetável via @InjectRepository(User) no UsersService.
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  // Exportar UsersService permite que AuthModule use findByEmail, updateRefreshToken, etc.
  exports: [UsersService],
})
export class UsersModule {}