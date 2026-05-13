/*
 * plus-ms-auth/src/users/entities/user.entity.ts
 *
 * Entidade TypeORM que mapeia a tabela 'users' no PostgreSQL.
 *
 * Papel na arquitetura:
 *   Define o schema da tabela de usuários e o tipo TypeScript correspondente.
 *   É usada pelo TypeORM para criar/sincronizar a tabela (via synchronize: true
 *   no AppModule) e para tipagem nas queries do Repository<User>.
 *
 * Escolha de design — Data Mapper vs. Active Record:
 *   TypeORM suporta ambos os padrões. Aqui usamos Data Mapper (@Entity sem métodos
 *   de persistência na classe), delegando as operações ao Repository injetado no
 *   UsersService. Trade-off: a entidade fica simples e testável, sem acoplamento
 *   ao ORM, mas requer o repositório separado.
 *
 * Campos de segurança:
 *   - passwordHash: nunca armazenamos a senha em texto plano.
 *   - hashedRefreshToken: o refresh_token também é hasheado; nullable para
 *     representar "sem sessão ativa" após logout.
 */

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  // UUID gerado automaticamente pelo banco — evita IDs sequenciais previsíveis.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique: true cria um índice UNIQUE no PostgreSQL — garante integridade no banco
  // além da validação feita pelo UsersService.
  @Column({ unique: true })
  email: string;

  // Armazena apenas o hash bcrypt da senha, nunca a senha original.
  @Column()
  passwordHash: string;

  // nullable: true porque o token é nulo após logout ou antes do primeiro login.
  // varchar explícito porque o TypeORM infere 'text' para string | null por padrão.
  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken: string | null;

  // Role controla o acesso a recursos (RBAC). 'vendedor' é o perfil padrão.
  // Valores possíveis: 'admin', 'gestor', 'vendedor'.
  @Column({ default: 'vendedor' })
  role: string;

  // Soft-disable: permite desativar um usuário sem deletar seus dados históricos.
  @Column({ default: true })
  isActive: boolean;
}