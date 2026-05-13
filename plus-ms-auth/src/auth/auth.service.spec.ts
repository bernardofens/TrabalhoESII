/*
 * plus-ms-auth/src/auth/auth.service.spec.ts
 *
 * Testes unitários do AuthService — scaffold gerado pelo NestJS CLI.
 *
 * Papel na arquitetura:
 *   Ponto de partida para testes da lógica de autenticação.
 *   O teste atual é um smoke test de instanciação. Testes de comportamento
 *   relevantes a adicionar:
 *     - login com credenciais válidas → retorna tokens
 *     - login com email inexistente → lança UnauthorizedException
 *     - login com senha errada → lança UnauthorizedException
 *     - refreshTokens com refresh_token inválido → lança ForbiddenException
 *
 * Para isolar o serviço, os providers UsersService, JwtService e ConfigService
 * devem ser mockados. Exemplo:
 *   providers: [AuthService, { provide: UsersService, useValue: mockUsersService }]
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Smoke test: verifica instanciação pelo DI sem erros de configuração.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});