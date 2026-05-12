import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Configuração do Swagger (Documentação da API)
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação - Loja Plus Size')
    .setDescription('Microsserviço de login e gestão de usuários (MS Auth)')
    .setVersion('1.0')
    .addBearerAuth() // Prepara o Swagger para aceitar o token JWT depois
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Escuta na porta 3001 (ou na porta que o Docker injetar)
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MS Auth rodando na porta: ${port}`);
  console.log(`🚀 Documentação do Swagger em: http://localhost:${port}/api/docs`);
}
bootstrap();
