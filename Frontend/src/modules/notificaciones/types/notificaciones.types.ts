export type TipoNotificacion = 'INFO' | 'EXITO' | 'ALERTA' | 'ERROR';

export type CanalNotificacion = 'PUSH' | 'SMS' | 'VOZ';

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  canales: CanalNotificacion[];
  turnoId?: string;
  leida: boolean;
  creadaEn: string;
}

export type TipoEventoDominio =
  | 'TurnoSolicitado'
  | 'ValidacionActualizada'
  | 'TurnoValidado'
  | 'TurnoRechazado'
  | 'TurnoCancelado'
  | 'ConductorEnCamino'
  | 'NovedadReportada'
  | 'MuelleRetrasado'
  | 'MuelleRestablecido'
  | 'MuelleEnMantenimiento';

/**
 * Evento que el backend empuja por SSE (GET /api/v1/events/stream).
 * Es el mismo contrato que publica el Event Bus del servidor.
 */
export interface EventoDominio {
  tipo: TipoEventoDominio;
  titulo: string;
  descripcion: string;
  severidad: TipoNotificacion;
  usuariosAfectados: string[];
  turnoId?: string;
  muelleId?: string;
  ocurridoEn: string;
}
