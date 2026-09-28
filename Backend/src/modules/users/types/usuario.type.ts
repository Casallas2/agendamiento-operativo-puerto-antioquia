import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';

/** Datos mínimos de un turno para resolver a quién hay que avisar */
export type DestinatariosTurno = {
  conductorId: string;
  empresaId: string;
};

export type PerfilResponse = RespuestaApiConDatos<UsuarioSesion>;
