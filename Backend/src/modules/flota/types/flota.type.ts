import type { EstadoRunt } from 'src/common/types/dominio.type';
import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';

/** Espejo de `Vehiculo` en el frontend (fechas como string ISO) */
export type VehiculoData = {
  id: string;
  placa: string;
  tipo: string;
  marca: string;
  empresaId: string;
  estadoRunt: EstadoRunt;
  vencimientoSoat: string;
  vencimientoTecnomecanica: string;
};

/** Espejo de `Conductor` en el frontend */
export type ConductorData = {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  categoriaLicencia: string;
  vencimientoLicencia: string;
  empresaId: string;
};

export type VehiculosResponse = RespuestaApiConDatos<VehiculoData[]>;
export type ConductoresResponse = RespuestaApiConDatos<ConductorData[]>;
