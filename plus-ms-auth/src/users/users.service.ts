/*
 * plus-ms-auth/src/users/users.service.ts
 *
 * Serviço de usuários — camada de acesso a dados e regras de negócio sobre User.
 *
 * Papel na arquitetura:
 *   Encapsula todas as operações sobre a entidade User: criação, busca e
 *   gerenciamento do refresh_token. Usado diretamente pelo UsersController
 *   (cadastro) e pelo AuthService (login, logout, refresh).
 *
 * Escolha de design — Repository Pattern (TypeORM):
 *   Usar Repository<User> injetado pelo TypeORM segue o padrão Data Mapper,
 *   onde a entidade não sabe como se persistir. A alternativa (Active Record)
 *   colocaria os métodos de busca direto na entidade — menos testável e
 *   mais acoplado ao ORM. Trade-off: mais verboso, mas facilita mocks em testes.
 */

import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository instrui o DI do NestJS a injetar o repositório
    // registrado pelo TypeOrmModule.forFeature([User]) no UsersModule.
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /*
   * Cria um novo usuário com senha hasheada.
   *
   * Fluxo: verifica unicidade do email → gera salt + hash bcrypt → persiste →
   * retorna usuário sem passwordHash (nunca expor o hash na resposta).
   *
   * fator de custo 10 no bcrypt: equilíbrio entre segurança e performance.
   * Valores acima de 12 tornam o login lento perceptivelmente em hardware comum.
   */
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      // ConflictException → HTTP 409: semanticamente correto para recurso duplicado.
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      // Role padrão 'vendedor' — o perfil com menos privilégios, seguindo o princípio
      // do menor privilégio (Principle of Least Privilege).
      role: createUserDto.role || 'vendedor',
    });

    const savedUser = await this.usersRepository.save(newUser);
    // Desestruturação para omitir passwordHash da resposta — nunca retornar hashes.
    const { passwordHash, ...result } = savedUser;
    return result;
  }

  /*
   * Busca usuário pelo email — usado pelo AuthService no fluxo de login.
   * Retorna null se não encontrado (sem lançar exceção — AuthService trata o caso).
   */
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  /* Busca usuário pelo ID — usado pelo AuthService no fluxo de refresh. */
  async findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  /*
   * Persiste o refresh_token hasheado no banco após login ou refresh.
   *
   * O token é hasheado com bcrypt antes de salvar: mesmo que o banco seja
   * comprometido, os refresh_tokens não são recuperáveis em texto plano.
   * Trade-off: bcrypt é lento (~100ms) — operação aceitável pois ocorre
   * apenas em login/refresh, não em cada requisição autenticada.
   */
  async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersRepository.update(userId, { hashedRefreshToken });
  }

  /*
   * Remove o refresh_token do banco — efetiva o logout.
   * null indica "sem sessão ativa"; tentativas de refresh serão rejeitadas
   * pelo AuthService que verifica !user.hashedRefreshToken.
   */
  async removeRefreshToken(userId: string) {
    await this.usersRepository.update(userId, { hashedRefreshToken: null });
  }
}