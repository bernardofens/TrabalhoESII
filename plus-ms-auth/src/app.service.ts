/*
 * plus-ms-auth/src/app.service.ts
 *
 * Serviço raiz da aplicação NestJS — scaffold padrão do CLI.
 *
 * Papel na arquitetura:
 *   Provê a lógica mínima de health-check consumida pelo AppController.
 *   @Injectable() registra esta classe no contêiner de DI do NestJS,
 *   tornando-a injetável em qualquer controller ou serviço do módulo raiz.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /* Retorna string de sanidade para o endpoint GET /. */
  getHello(): string {
    return 'Hello World!';
  }
}