import { api } from '@/core/api/api';
import type { RespuestaApi } from '@/core/api/respuestaApi';
import type { Muelle, RetrasoMuellePayload } from '../types/muelles.types';

/** GET /api/v1/docks */
const obtenerMuelles = async (): Promise<Muelle[]> => {
  const { data } = await api.get<RespuestaApi<Muelle[]>>('/docks');
  return data.data;
};

/**
 * POST /api/v1/docks/:id/delay → publica el evento MuelleRetrasado.
 * Devuelve cuántos turnos próximos quedaron notificados.
 */
const declararRetraso = async ({ muelleId, ...payload }: RetrasoMuellePayload): Promise<number> => {
  const { data } = await api.post<RespuestaApi<number>>(`/docks/${muelleId}/delay`, payload);
  return data.data;
};

/** POST /api/v1/docks/:id/restore → devuelve los turnos a su horario original */
const restablecerOperacion = async (muelleId: string): Promise<number> => {
  const { data } = await api.post<RespuestaApi<number>>(`/docks/${muelleId}/restore`);
  return data.data;
};

/** POST /api/v1/docks/:id/maintenance → alterna la disponibilidad del muelle */
const alternarMantenimiento = async (muelleId: string): Promise<Muelle> => {
  const { data } = await api.post<RespuestaApi<Muelle>>(`/docks/${muelleId}/maintenance`);
  return data.data;
};

export const muellesService = {
  obtenerMuelles,
  declararRetraso,
  restablecerOperacion,
  alternarMantenimiento,
};
