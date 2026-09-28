import { api } from '@/core/api/api';
import type { RespuestaApi } from '@/core/api/respuestaApi';
import type { ReporteOperacion } from '../types/alertas.types';

/** GET /api/v1/reports/operation: indicadores agregados para el panel y la vista de reportes */
const obtenerReporte = async (): Promise<ReporteOperacion> => {
  const { data } = await api.get<RespuestaApi<ReporteOperacion>>('/reports/operation');
  return data.data;
};

export const alertasService = {
  obtenerReporte,
};
