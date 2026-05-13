/*
 * plus-ms-auth/src/auth/auth.module.ts
 *
 * Módulo de autenticação — agrupa tudo relacionado a login, logout e renovação de tokens.
 *
 * Papel na arquitetura:
 *   Registra o JwtModule com configuração async (lê JWT_SECRET do ambiente),
 *   importa UsersModule para que AuthService possa consultar e atualizar usuários,
 *   e declara JwtStrategy como provider para que o Passport saiba validar tokens.
 *
 * Escolha de design — JwtModule.registerAsync:
 *   Usar registerAsync em vez de register() síncrono é necessário porque o JWT_SECRET
 *   vem do ConfigService, que só está disponível após o DI container ser inicializado.
 *   Trade-off: ligeiramente mais verboso, mas garante que o secret nunca seja undefined.
 */

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // UsersModule é importado para AuthService ter acesso a findByEmail,
    // updateRefreshToken e removeRefreshToken sem criar dependência circular.
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // expiresIn aqui afeta apenas o signAsync sem opções explícitas.
        // AuthService sobrescreve para access_token (15m) e refresh_token (7d).
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy precisa ser provider para o Passport registrá-la como 'jwt'.
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}