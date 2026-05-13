/*
 * plus-ms-auth/src/main.ts
 *
 * Ponto de entrada do microserviço de autenticação (NestJS).
 *
 * Papel na arquitetura:
 *   Inicializa a aplicação NestJS, configura CORS para permitir requisições
 *   do plus-mfe-auth (origem diferente) e sobe a documentação Swagger.
 *   É o único arquivo executado diretamente pelo Node.js — tudo mais é
 *   carregado pelo sistema de injeção de dependências do NestJS via AppModule.
 *
 * Conexões externas:
 *   - plus-mfe-auth faz requisições HTTP para este serviço (porta 3001).
 *   - Docker pode substituir a porta via variável de ambiente PORT.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/*
 * Função de bootstrap — inicializa e sobe o servidor NestJS.
 *
 * É async porque NestFactory.create e app.listen são operações assíncronas
 * (abre socket TCP, conecta ao banco via TypeORM, etc.).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS habilitado sem restrição de origem para simplificar o desenvolvimento.
  // Em produção, deve-se restringir para a URL do Shell: enableCors({ origin: '...' }).
  app.enableCors();

  // Swagger gera documentação interativa em /api/docs.
  // addBearerAuth() adiciona o campo de token JWT na UI do Swagger,
  // permitindo testar endpoints protegidos sem Postman.
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação - Loja Plus Size')
    .setDescription('Microsserviço de login e gestão de usuários (MS Auth)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // PORT é injetada pelo Docker/orquestrador em produção.
  // Fallback para 3001 em desenvolvimento local.
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MS Auth rodando na porta: ${port}`);
  console.log(`🚀 Documentação do Swagger em: http://localhost:${port}/api/docs`);
}
bootstrap();
