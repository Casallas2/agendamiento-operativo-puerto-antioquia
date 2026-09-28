import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';

/** Espejo de `IndicadoresOperacion` en el frontend */
export type IndicadoresOperacion = {
  turnosHoy: number;
  turnosConfirmadosHoy: number;
  turnosEnValidacion: number;
  vehiculosEnCamino: number;
  tasaRechazoDocumental: number;
  muellesConNovedad: number;
  esperaPromedioMinutos: number;
  reduccionEsperaPorcentaje: number;
};

export type OcupacionFranja = {
  franja: string;
  ocupados: number;
  capacidad: number;
};

export type RechazoPorMotivo = {
  motivo: string;
  cantidad: number;
};

export type PuntoEsperaGrafico = {
  dia: string;
  minutos: number;
};

/** Espejo de `ReporteOperacion` en el frontend */
export type ReporteOperacion = {
  indicadores: IndicadoresOperacion;
  ocupacionPorFranja: OcupacionFranja[];
  rechazosPorMotivo: RechazoPorMotivo[];
  historialEspera: PuntoEsperaGrafico[];
};

export type ReporteResponse = RespuestaApiConDatos<ReporteOperacion>;
