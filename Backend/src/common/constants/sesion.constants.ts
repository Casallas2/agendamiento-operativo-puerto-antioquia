import type { RolUsuario } from '../types/dominio.type';
import type { AreaSesion } from '../types/usuario-sesion.type';

/**
 * Nombres de cookie por área. Deben coincidir con `CLAVE_COOKIE_*` de
 * `Frontend/src/core/config/catalogos.ts` y con `Frontend/src/proxy.ts`.
 * Reason: al usar una cookie distinta por área, un mismo navegador puede sostener a la vez
 * la sesión de cabina y la del portal, que es lo que exige la demostración del parcial.
 */
export const COOKIE_CABINA = 'puerto-sesion-cabina';
export const COOKIE_PORTAL = 'puerto-sesion-portal';

/** Cabecera con la que el cliente declara desde qué área hace la petición */
export const CABECERA_AREA = 'x-area-sesion';

export const AREAS_SESION: Record<AreaSesion, string> = {
  CABINA: COOKIE_CABINA,
  PORTAL: COOKIE_PORTAL,
};

export const obtenerAreaPorRol = (rol: RolUsuario): AreaSesion =>
  rol === 'CONDUCTOR' ? 'CABINA' : 'PORTAL';

export const obtenerCookiePorRol = (rol: RolUsuario): string => AREAS_SESION[obtenerAreaPorRol(rol)];
