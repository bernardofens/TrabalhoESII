/*
 * plus-ms-auth/src/auth/jwt.strategy.ts
 *
 * Estratégia Passport para validação de tokens JWT.
 *
 * Papel na arquitetura:
 *   Integra o Passport.js com o NestJS para autenticação baseada em JWT.
 *   Quando um endpoint usa @UseGuards(AuthGuard('jwt')), o Passport executa
 *   esta strategy automaticamente: extrai o token do header, verifica a assinatura
 *   e chama validate() com o payload decodificado.
 *
 * Escolha de design — PassportStrategy vs. verificação manual:
 *   Usar PassportStrategy centraliza a lógica de extração e validação de JWT.
 *   A alternativa (verificar o token manualmente em cada guard) seria mais verbosa
 *   e propensa a inconsistências. Trade-off: acoplamento ao Passport/passport-jwt.
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrai o token do header Authorization: Bearer <token>
      // Trade-off: tokens no header são mais seguros que query params (não aparecem em logs),
      // mas exigem que o cliente configure o header em cada requisição.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false garante que tokens expirados sejam rejeitados.
      // Nunca setar como true em produção.
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'fallback_secreto_para_o_ts_nao_chorar',
    });
  }

  /*
   * Chamado pelo Passport após verificar a assinatura do JWT.
   * O retorno é anexado a req.user — disponível nos controllers via @Request().
   *
   * Mapeamos sub → userId para seguir a convenção JWT (sub = subject = identificador).
   * Incluímos role para que RolesGuard possa verificar permissões sem consultar o banco.
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}