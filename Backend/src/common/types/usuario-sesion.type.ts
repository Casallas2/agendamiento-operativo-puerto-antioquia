import type { RolUsuario } from './dominio.type';

/** Identidad del usuario autenticado; espejo de `Usuario` en el frontend */
export type UsuarioSesion = {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  telefono: string;
  empresaId?: string;
  empresaNombre?: string;
  conductorId?: string;
};

/** Contenido firmado dentro del JWT que viaja en la cookie httpOnly */
export type PayloadJwt = {
  sub: string;
  correo: string;
  rol: RolUsuario;
  area: AreaSesion;
};

/** Área de la plataforma: la cabina del conductor y el portal web son sesiones independientes */
export type AreaSesion = 'CABINA' | 'PORTAL';
