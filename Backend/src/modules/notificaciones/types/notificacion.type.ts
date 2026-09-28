import type { RespuestaApi, RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';
import type { CanalNotificacion, TipoNotificacion } from 'src/common/types/dominio.type';

/** Espejo de `Notificacion` en el frontend */
export type NotificacionData = {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  canales: CanalNotificacion[];
  turnoId?: string;
  leida: boolean;
  creadaEn: string;
};

export type NotificacionesResponse = RespuestaApiConDatos<NotificacionData[]>;
export type NotificacionesLeidasResponse = RespuestaApi;
