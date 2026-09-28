import { Injectable, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CLAVE_RUTA_PUBLICA } from '../decorators/public.decorator';

/**
 * Guard global de autenticación. Deja pasar solo las rutas marcadas con `@Publico()`.
 * El token se lee de la cookie httpOnly emitida por el API (nunca del localStorage).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(contexto: ExecutionContext) {
    const esPublica = this.reflector.getAllAndOverride<boolean>(CLAVE_RUTA_PUBLICA, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    return esPublica ? true : super.canActivate(contexto);
  }

  handleRequest<TUsuario>(error: unknown, usuario: TUsuario): TUsuario {
    if (error || !usuario) {
      throw new UnauthorizedException('Tu sesión expiró. Inicia sesión de nuevo.');
    }
    return usuario;
  }
}
