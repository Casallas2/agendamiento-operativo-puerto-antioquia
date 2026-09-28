import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CLAVE_ROLES } from '../decorators/roles.decorator';
import type { RolUsuario } from '../types/dominio.type';
import type { UsuarioSesion } from '../types/usuario-sesion.type';

/** Autorización por rol a nivel de recurso; complementa a `JwtAuthGuard` */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<RolUsuario[]>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!rolesPermitidos?.length) {
      return true;
    }

    const peticion = contexto.switchToHttp().getRequest<Request & { user?: UsuarioSesion }>();
    const usuario = peticion.user;
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return true;
  }
}
