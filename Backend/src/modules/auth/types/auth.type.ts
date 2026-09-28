import type { RespuestaApi, RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';

/** Espejo de `DesafioMfa` en el frontend */
export type DesafioMfaData = {
  desafioId: string;
  telefonoEnmascarado: string;
  nombreUsuario: string;
};

export type DesafioMfaResponse = RespuestaApiConDatos<DesafioMfaData>;
export type SesionResponse = RespuestaApiConDatos<UsuarioSesion>;
export type CierreSesionResponse = RespuestaApi;
