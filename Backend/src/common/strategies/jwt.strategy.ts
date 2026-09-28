import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { AREAS_SESION, CABECERA_AREA, COOKIE_CABINA, COOKIE_PORTAL } from '../constants/sesion.constants';
import type { AreaSesion, PayloadJwt, UsuarioSesion } from '../types/usuario-sesion.type';

/**
 * Lee el JWT de la cookie httpOnly correspondiente al área desde la que se hace la petición.
 * Reason: la cabina y el portal usan cookies distintas para poder coexistir en el mismo
 * navegador; la cabecera `x-area-sesion` (que envía el interceptor de Axios) desempata.
 */
const extraerTokenDeCookie = (peticion: Request): string | null => {
  const cookies = (peticion.cookies ?? {}) as Record<string, string | undefined>;
  // `EventSource` no puede enviar cabeceras, por eso el canal SSE declara el área por query
  const areaDeclarada = (peticion.headers[CABECERA_AREA] ?? peticion.query?.area) as
    | AreaSesion
    | undefined;

  if (areaDeclarada && AREAS_SESION[areaDeclarada]) {
    return cookies[AREAS_SESION[areaDeclarada]] ?? null;
  }
  // Sin cabecera se intenta el portal y luego la cabina (p. ej. peticiones directas o Swagger)
  return cookies[COOKIE_PORTAL] ?? cookies[COOKIE_CABINA] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extraerTokenDeCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** El perfil se relee de la base en cada petición: nunca se confía en los datos del token */
  async validate(payload: PayloadJwt): Promise<UsuarioSesion> {
    const usuario = await this.usersService.buscarSesionPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Tu sesión expiró. Inicia sesión de nuevo.');
    }
    return usuario;
  }
}
