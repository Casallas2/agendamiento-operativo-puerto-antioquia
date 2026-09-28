import type { SeveridadEvento, TipoEventoDominio } from 'src/common/types/dominio.type';

/**
 * Mensaje que viaja por el Event Bus. Espejo exacto de `EventoDominio` en el frontend,
 * que lo recibe por SSE en `useEscucharTiempoReal`.
 */
export type EventoDominio = {
  tipo: TipoEventoDominio;
  titulo: string;
  descripcion: string;
  severidad: SeveridadEvento;
  usuariosAfectados: string[];
  turnoId?: string;
  muelleId?: string;
  ocurridoEn: string;
};

/** Evento tal como lo publica un servicio: el bus le pone la marca de tiempo */
export type EventoPublicable = Omit<EventoDominio, 'ocurridoEn'>;

/**
 * Contrato del patrón Observer (Figura 2 del diseño arquitectónico):
 * cada observador decide de forma independiente cómo reaccionar al evento.
 */
export interface ObservadorEvento {
  readonly nombre: string;
  actualizar(evento: EventoDominio): Promise<void> | void;
}
