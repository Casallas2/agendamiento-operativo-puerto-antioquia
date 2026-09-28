import type { EstadoTurno } from 'src/common/types/dominio.type';

/**
 * Etiquetas legibles de cada estado, usadas en los mensajes al usuario.
 * Espejo de `ETIQUETAS_ESTADO_TURNO` en `Frontend/src/core/config/catalogos.ts`.
 */
export const ETIQUETAS_ESTADO_TURNO: Record<EstadoTurno, string> = {
  PENDIENTE_VALIDACION: 'Validando documentos',
  CONFIRMADO: 'Confirmado',
  RECHAZADO: 'Rechazado',
  EN_CAMINO: 'En camino',
  CON_NOVEDAD: 'Con novedad',
  EN_PUERTO: 'En puerto',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

/** Estados que el conductor ve en la cabina */
export const ESTADOS_VISIBLES_CABINA: EstadoTurno[] = [
  'PENDIENTE_VALIDACION',
  'CONFIRMADO',
  'EN_CAMINO',
  'CON_NOVEDAD',
  'EN_PUERTO',
];

/** Desde estos estados el conductor puede declarar que va en camino */
export const ESTADOS_QUE_PERMITEN_VIAJAR: EstadoTurno[] = ['CONFIRMADO', 'CON_NOVEDAD'];

/** Una novedad solo interrumpe el viaje si el turno seguía vigente */
export const ESTADOS_INTERRUMPIBLES: EstadoTurno[] = ['CONFIRMADO', 'EN_CAMINO'];

/** Estados que se consideran "activos" para los indicadores de operación */
export const ESTADOS_TURNO_ATENDIDOS: EstadoTurno[] = [
  'CONFIRMADO',
  'EN_CAMINO',
  'EN_PUERTO',
  'COMPLETADO',
];
