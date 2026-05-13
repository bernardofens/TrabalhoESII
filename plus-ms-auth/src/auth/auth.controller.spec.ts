/*
 * plus-ms-auth/src/auth/auth.controller.spec.ts
 *
 * Testes unitários do AuthController — scaffold gerado pelo NestJS CLI.
 *
 * Papel na arquitetura:
 *   Ponto de partida para testes do controller de autenticação.
 *   O teste atual apenas verifica que o controller é instanciado pelo DI
 *   (smoke test). Testes de comportamento (login, logout, refresh) devem
 *   ser adicionados aqui com mocks do AuthService.
 *
 * Nota: o AuthController depende de AuthService, que por sua vez depende de
 * UsersService, JwtService e ConfigService. Para testes isolados, esses
 * providers devem ser substituídos por mocks via useValue ou jest.fn().
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // Smoke test: verifica que o DI consegue instanciar o controller sem erros.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});