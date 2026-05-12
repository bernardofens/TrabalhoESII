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

  canActivate(context: ExecutionContext): boolean {
    // Pega as roles exigidas que definiremos nas rotas
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // Se a rota não exigir role específica, deixa passar
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // O usuário validado pela JwtStrategy

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verifica se a role do usuário bate com alguma das permitidas
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Requer um destes perfis: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}