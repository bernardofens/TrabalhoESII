# MS Auth - Projeto Sistema de Gestão de Estoque de Roupas Plus Size

Microsserviço de Autenticação e Autorização desenvolvido para o Sistema de Gestão de Estoque Plus Size.

Este serviço é responsável por gerenciar a identidade dos usuários, emitir tokens JWT (Access e Refresh), aplicar controle de acesso baseado em perfis (RBAC) e revogar sessões. Ele atua como a única fonte de verdade para a autenticação na arquitetura de microsserviços do projeto.

## Tecnologias Utilizadas

* **Framework:** NestJS (TypeScript)
* **Banco de Dados:** PostgreSQL (TypeORM)
* **Segurança:** Passport, BcryptJS, JWT
* **Infraestrutura Local:** Docker, Docker Compose, Ministack

## Pré-requisitos

Para executar este projeto, é necessário ter instalado na máquina:
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

## Instruções de Execução

A inicialização do serviço é gerenciada pelo repositório de infraestrutura (`plus-infra`).

1. Clone o repositório de infraestrutura no mesmo diretório pai deste projeto.
2. Navegue até a pasta de infraestrutura e inicie os contêineres:

```bash
cd ../plus-infra
docker-compose up -d --build
```


O microsserviço estará disponível em: (`http://localhost:3001`)

## Documentação da API

A API está documentada utilizando a especificação OpenAPI 3.0 (Swagger).
Com a aplicação em execução, acesse a interface interativa em:

(`http://localhost:3001/api/docs`)

## Escopo Implementado (T1)

* Cadastro e login de usuários com senhas criptografadas.
* Emissão e validação de tokens JWT (Access e Refresh).
* Implementação de rotas protegidas e validação de permissões (RolesGuard).
* Revogação de tokens para logout seguro.
* Endpoint de introspecção para integração com AWS API Gateway.
## Versão

v1.0.0 - Entrega T1