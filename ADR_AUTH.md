# ADR - MS Auth: Decisoes de Arquitetura

Status: Aceito | Data: Maio 2026
Autores: Equipe Plus Size - ES2 Turma 30 PUCRS

DECISAO 1 - NestJS em vez de Express puro
Contexto: O boilerplate do professor usava Express.js simples (index.js, ~60 linhas).
Opcoes: A) Express puro  B) NestJS  C) FastAPI (Python)
Decisao: NestJS (B)
Motivo: DI, modulos, guards e decorators Swagger nativos reduzem boilerplate.
Consequencias: (+) Codigo organizado e testavel  (-) Curva de aprendizado maior

DECISAO 2 - TypeORM com synchronize:true
Contexto: Precisamos persistir usuarios e refresh tokens no PostgreSQL.
Opcoes: A) Migrations SQL manuais  B) TypeORM synchronize:true  C) Prisma ORM
Decisao: TypeORM synchronize:true (B)
Motivo: Cria tabelas automaticamente em dev, sem scripts de migration manuais.
Consequencias: (+) Zero config em dev  (-) Em producao usar synchronize:false

DECISAO 3 - JWT Access Token 15min + Refresh Token 7 dias
Contexto: Autenticacao segura com suporte a revogacao.
Opcoes: A) Apenas access token longo  B) Access curto + refresh hasheado no banco  C) Sessoes
Decisao: Opcao B
Motivo: Refresh hasheado com bcrypt permite revogacao real no logout.
Consequencias: (+) Logout invalida sessao imediatamente  (-) Requer coluna hashedRefreshToken

DECISAO 4 - RBAC roles admin, gestor, vendedor
Contexto: A loja precisa de diferentes niveis de acesso.
Opcoes: A) Sem controle  B) RBAC com roles no JWT  C) ABAC
Decisao: RBAC (B)
Motivo: Simples com RolesGuard + @SetMetadata do NestJS.
Consequencias: (+) Implementacao direta e legivel  (-) Adicionar permissao exige novo role