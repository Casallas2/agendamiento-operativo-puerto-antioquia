import { addHours, startOfDay, subDays } from 'date-fns';
import type { CanalNotificacion, TipoNotificacion } from 'src/common/types/dominio.type';
import { ID } from './datos-maestros';

export type NotificacionSemilla = {
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  canales: CanalNotificacion[];
  turnoId: string | null;
  leida: boolean;
  creadaEn: Date;
};

/**
 * Bandeja inicial de cada rol, para que el panel de notificaciones no arranque vacío
 * durante la sustentación.
 */
export const construirNotificaciones = (
  ahora: Date,
  idsPorCodigo: Map<string, string>,
): NotificacionSemilla[] => {
  const hoy = startOfDay(ahora);

  return [
    {
      usuarioId: ID.usuarioConductor,
      titulo: 'Turno confirmado',
      mensaje: 'Tu turno TRN-1001 en Muelle 2 fue confirmado. Documentación validada.',
      tipo: 'EXITO',
      canales: ['PUSH', 'VOZ'],
      turnoId: idsPorCodigo.get('TRN-1001') ?? null,
      leida: false,
      creadaEn: subDays(ahora, 1),
    },
    {
      usuarioId: ID.usuarioTransportista,
      titulo: 'Documentación rechazada',
      mensaje: 'El turno TRN-1003 fue rechazado: el manifiesto no se encuentra registrado en la DIAN.',
      tipo: 'ERROR',
      canales: ['PUSH', 'SMS'],
      turnoId: idsPorCodigo.get('TRN-1003') ?? null,
      leida: false,
      creadaEn: subDays(ahora, 1),
    },
    {
      usuarioId: ID.usuarioTransportista,
      titulo: 'SOAT próximo a vencer',
      mensaje: 'El SOAT del vehículo SNZ-915 vence en 12 días. Renuévalo para no perder turnos.',
      tipo: 'ALERTA',
      canales: ['PUSH', 'SMS'],
      turnoId: null,
      leida: false,
      creadaEn: addHours(hoy, 6),
    },
    {
      usuarioId: ID.usuarioOperador,
      titulo: 'Muelle 4 en mantenimiento',
      mensaje: 'El Muelle 4 no recibe turnos mientras dura el mantenimiento de la grúa pórtico.',
      tipo: 'ALERTA',
      canales: ['PUSH', 'SMS'],
      turnoId: null,
      leida: false,
      creadaEn: addHours(hoy, 5),
    },
  ];
};
