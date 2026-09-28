import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UsuarioSesion } from '../types/usuario-sesion.type';

/** Inyecta el usuario autenticado que `JwtStrategy` dejó en la petición */
export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioSesion => {
    const peticion = contexto.switchToHttp().getRequest<Request & { user: UsuarioSesion }>();
    return peticion.user;
  },
);
