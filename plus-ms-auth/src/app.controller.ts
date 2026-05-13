/*
 * plus-ms-auth/src/app.controller.ts
 *
 * Controller raiz da aplicação NestJS — gerado pelo CLI como scaffold padrão.
 *
 * Papel na arquitetura:
 *   Expõe GET / como health-check mínimo. Em produção, este endpoint pode ser
 *   usado por load balancers para verificar se o serviço está respondendo.
 *   A lógica real de autenticação e usuários fica em AuthModule e UsersModule.
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /*
   * GET / — endpoint de sanidade do serviço.
   * Delega para AppService seguindo o padrão thin-controller do NestJS:
   * controllers apenas roteiam, serviços contêm a lógica.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}