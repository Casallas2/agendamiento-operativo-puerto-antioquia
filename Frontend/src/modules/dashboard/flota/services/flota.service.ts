import { differenceInCalendarDays } from 'date-fns';
import { api } from '@/core/api/api';
import type { RespuestaApi } from '@/core/api/respuestaApi';
import type { Conductor, EstadoDocumento, Vehiculo } from '../types/flota.types';

const DIAS_ALERTA_VENCIMIENTO = 30;

export const evaluarDocumento = (nombre: string, vencimiento: string, fechaReferencia = new Date()): EstadoDocumento => {
  const diasRestantes = differenceInCalendarDays(new Date(vencimiento), fechaReferencia);
  const semaforo = diasRestantes < 0 ? 'VENCIDO' : diasRestantes <= DIAS_ALERTA_VENCIMIENTO ? 'POR_VENCER' : 'VIGENTE';
  return { nombre, vencimiento, semaforo, diasRestantes };
};

export const evaluarDocumentosVehiculo = (vehiculo: Vehiculo, fechaReferencia?: Date) => [
  evaluarDocumento('SOAT', vehiculo.vencimientoSoat, fechaReferencia),
  evaluarDocumento('Técnico-mecánica', vehiculo.vencimientoTecnomecanica, fechaReferencia),
];

export const evaluarDocumentosConductor = (conductor: Conductor, fechaReferencia?: Date) => [
  evaluarDocumento('Licencia', conductor.vencimientoLicencia, fechaReferencia),
];

/** GET /api/v1/fleet/vehicles — el backend ya filtra por empresa (mínimo privilegio) */
const obtenerVehiculos = async (): Promise<Vehiculo[]> => {
  const { data } = await api.get<RespuestaApi<Vehiculo[]>>('/fleet/vehicles');
  return data.data;
};

/** GET /api/v1/fleet/drivers */
const obtenerConductores = async (): Promise<Conductor[]> => {
  const { data } = await api.get<RespuestaApi<Conductor[]>>('/fleet/drivers');
  return data.data;
};

export const flotaService = {
  obtenerVehiculos,
  obtenerConductores,
};
