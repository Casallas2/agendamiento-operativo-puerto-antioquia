import { api } from '@/core/api/api';
import type { RespuestaApi } from '@/core/api/respuestaApi';
import type { TurnoDetallado } from '@/modules/dashboard/turnos/types/turnos.types';
import type { ResumenConductor } from '../types/conductor.types';

/** GET /api/v1/driver/summary — turno actual, vehículo, muelle y próximos turnos */
const obtenerResumen = async (): Promise<ResumenConductor> => {
  const { data } = await api.get<RespuestaApi<ResumenConductor>>('/driver/summary');
  return data.data;
};

/** POST /api/v1/driver/bookings/:id/on-route → evento ConductorEnCamino */
const marcarEnCamino = async (turnoId: string): Promise<TurnoDetallado> => {
  const { data } = await api.post<RespuestaApi<TurnoDetallado>>(`/driver/bookings/${turnoId}/on-route`);
  return data.data;
};

/** POST /api/v1/driver/bookings/:id/incident → evento NovedadReportada */
const reportarNovedad = async (turnoId: string, novedad: string): Promise<TurnoDetallado> => {
  const { data } = await api.post<RespuestaApi<TurnoDetallado>>(
    `/driver/bookings/${turnoId}/incident`,
    { novedad },
  );
  return data.data;
};

export const conductorService = {
  obtenerResumen,
  marcarEnCamino,
  reportarNovedad,
};
