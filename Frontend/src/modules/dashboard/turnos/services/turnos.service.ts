import { api } from '@/core/api/api';
import type { RespuestaApi } from '@/core/api/respuestaApi';
import type { CrearTurnoPayload, FiltroTurnos, Franja, Turno, TurnoDetallado } from '../types/turnos.types';

/** GET /api/v1/bookings — la visibilidad por rol y empresa la resuelve el backend */
const obtenerTurnos = async (filtro: FiltroTurnos = {}): Promise<TurnoDetallado[]> => {
  const { data } = await api.get<RespuestaApi<TurnoDetallado[]>>('/bookings', {
    params: {
      estado: filtro.estado && filtro.estado !== 'TODOS' ? filtro.estado : undefined,
      busqueda: filtro.busqueda?.trim() || undefined,
    },
  });
  return data.data;
};

/** GET /api/v1/bookings/:id */
const obtenerTurno = async (turnoId: string): Promise<TurnoDetallado> => {
  const { data } = await api.get<RespuestaApi<TurnoDetallado>>(`/bookings/${turnoId}`);
  return data.data;
};

/** GET /api/v1/slots?fecha=YYYY-MM-DD */
const obtenerFranjas = async (fecha: string): Promise<Franja[]> => {
  const { data } = await api.get<RespuestaApi<Franja[]>>('/slots', { params: { fecha } });
  return data.data;
};

/**
 * POST /api/v1/bookings → 202 Accepted.
 * Reason: la reserva del cupo es inmediata (RF-01) y la validación documental continúa
 * de forma asíncrona tras el evento TurnoSolicitado, tal como define la arquitectura EDA.
 * El resultado de esa validación llega por el canal de eventos en tiempo real.
 */
const crearTurno = async (payload: CrearTurnoPayload): Promise<Turno> => {
  const { data } = await api.post<RespuestaApi<TurnoDetallado>>('/bookings', payload);
  return data.data;
};

/** POST /api/v1/bookings/:id/cancel — libera el cupo y notifica al conductor */
const cancelarTurno = async (turnoId: string): Promise<Turno> => {
  const { data } = await api.post<RespuestaApi<TurnoDetallado>>(`/bookings/${turnoId}/cancel`);
  return data.data;
};

export const turnosService = {
  obtenerTurnos,
  obtenerTurno,
  obtenerFranjas,
  crearTurno,
  cancelarTurno,
};
