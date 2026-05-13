/*
 * plus-ms-auth/src/app.controller.spec.ts
 *
 * Testes unitários do AppController.
 *
 * Papel na arquitetura:
 *   Verifica o comportamento do endpoint GET / sem subir o servidor HTTP completo.
 *   Usa o TestingModule do NestJS para montar apenas os providers necessários
 *   (AppController + AppService), isolando o teste de banco de dados e JWT.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    // Test.createTestingModule monta um módulo NestJS mínimo para testes —
    // apenas os providers declarados aqui são instanciados (sem banco, sem JWT).
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});