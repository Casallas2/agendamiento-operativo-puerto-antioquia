import { api } from '@/core/api/api';
import type { RespuestaApi, RespuestaApiVacia } from '@/core/api/respuestaApi';
import type { Notificacion } from '../types/notificaciones.types';

/** GET /api/v1/notifications — el backend devuelve las 30 más recientes del usuario */
const obtenerNotificaciones = async (): Promise<Notificacion[]> => {
  const { data } = await api.get<RespuestaApi<Notificacion[]>>('/notifications');
  return data.data;
};

/** POST /api/v1/notifications/read-all */
const marcarTodasLeidas = async (): Promise<void> => {
  await api.post<RespuestaApiVacia>('/notifications/read-all');
};

export const notificacionesService = {
  obtenerNotificaciones,
  marcarTodasLeidas,
};
