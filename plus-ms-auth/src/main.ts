import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Validação global dos DTOs (class-validator + class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger (Documentação da API)
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação - Loja Plus Size')
    .setDescription('Microsserviço de login e gestão de usuários (MS Auth)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MS Auth rodando na porta: ${port}`);
  console.log(`🚀 Documentação do Swagger em: http://localhost:${port}/api/docs`);
}
bootstrap();
