/*
 * plus-ms-auth/src/auth/guards/roles.guard.ts
 *
 * Guard de autorização baseado em papéis (RBAC — Role-Based Access Control).
 *
 * Papel na arquitetura:
 *   Aplicado APÓS AuthGuard('jwt'), que já validou a identidade do usuário.
 *   Lê as roles exigidas da rota via Reflector e compara com user.role
 *   populado pela JwtStrategy. Protege rotas que exigem perfis específicos
 *   (ex: admin, gestor) além de autenticação.
 *
 * Escolha de design — Reflector + @SetMetadata:
 *   Usar metadados de rota em vez de parâmetros do guard permite que as
 *   roles sejam declaradas próximas ao endpoint (@SetMetadata), tornando
 *   a intenção mais explícita. Trade-off: metadados são strings tipadas
 *   manualmente — um decorator @Roles() tipado seria mais seguro.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /*
   * Verifica se o usuário autenticado possui a role exigida pela rota.
   *
   * Retorna true para liberar acesso, lança ForbiddenException para negar.
   * Se a rota não tem @SetMetadata('roles', [...]), não há restrição de role.
   */
  canActivate(context: ExecutionContext): boolean {
    // Reflector lê os metadados registrados pelo @SetMetadata('roles', [...]) na rota.
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Rota sem restrição de role — qualquer usuário autenticado pode acessar.
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // req.user é populado pela JwtStrategy após validar o Bearer token.
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Requer um destes perfis: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}