/*
 * plus-ms-auth/src/app.module.ts
 *
 * Módulo raiz do microserviço de autenticação.
 *
 * Papel na arquitetura:
 *   É o ponto de montagem de toda a aplicação NestJS. Configura as dependências
 *   de infraestrutura (banco de dados, variáveis de ambiente) e registra os
 *   módulos de domínio (UsersModule, AuthModule).
 *
 * Escolhas de design:
 *   - ConfigModule global: evita re-importar ConfigModule em cada módulo filho.
 *     Trade-off: acoplamento implícito, mas preferível à verbosidade de imports repetidos.
 *   - TypeOrmModule.forRootAsync: usa ConfigService para ler as credenciais do banco
 *     em runtime, nunca hardcoded. Necessário porque ConfigModule precisa ser
 *     inicializado antes do TypeORM resolver a factory.
 *   - synchronize: true: o TypeORM sincroniza o schema do banco com as entidades
 *     automaticamente a cada inicialização. Conveniente em dev, mas PERIGOSO em
 *     produção (pode dropar colunas). Deve ser substituído por migrations em prod.
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // isGlobal: true torna ConfigService disponível em toda a aplicação sem
    // precisar importar ConfigModule em cada módulo filho.
    ConfigModule.forRoot({ isGlobal: true }),

    // forRootAsync permite injetar ConfigService na factory, garantindo que
    // as variáveis de ambiente sejam resolvidas antes da conexão ao banco.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Lista explícita de entidades em vez de glob pattern para ter controle
        // total sobre quais tabelas o TypeORM gerencia.
        entities: [User],
        // ATENÇÃO: true apenas em desenvolvimento. Em produção usar migrations.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}