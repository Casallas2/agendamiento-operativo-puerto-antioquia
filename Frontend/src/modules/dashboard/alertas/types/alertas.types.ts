export interface IndicadoresOperacion {
  turnosHoy: number;
  turnosConfirmadosHoy: number;
  turnosEnValidacion: number;
  vehiculosEnCamino: number;
  tasaRechazoDocumental: number;
  muellesConNovedad: number;
  esperaPromedioMinutos: number;
  reduccionEsperaPorcentaje: number;
}

export interface OcupacionFranja {
  franja: string;
  ocupados: number;
  capacidad: number;
}

export interface RechazoPorMotivo {
  motivo: string;
  cantidad: number;
}

export interface PuntoEsperaGrafico {
  dia: string;
  minutos: number;
}

export interface ReporteOperacion {
  indicadores: IndicadoresOperacion;
  ocupacionPorFranja: OcupacionFranja[];
  rechazosPorMotivo: RechazoPorMotivo[];
  historialEspera: PuntoEsperaGrafico[];
}
