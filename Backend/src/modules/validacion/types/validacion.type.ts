import type { TipoValidacion } from 'src/common/types/dominio.type';

export type ResultadoValidacion = {
  aprobado: boolean;
  mensaje: string;
};

export type DocumentoCarga = {
  numeroManifiesto: string;
  numeroBl: string;
  /** Solo presente cuando el turno transporta carga refrigerada (OCI-001) */
  numeroCertificadoIca?: string;
};

export type DocumentoVehiculo = 'SOAT' | 'TECNOMECANICA';

/** Definición de cada validación del catálogo y el sistema externo que la resuelve */
export type DefinicionValidacion = {
  tipo: TipoValidacion;
  etiqueta: string;
  fuente: string;
  /** La validación solo se ejecuta para turnos de carga refrigerada */
  soloCargaRefrigerada?: boolean;
};

export const construirResultado = (aprobado: boolean, mensaje: string): ResultadoValidacion => ({
  aprobado,
  mensaje,
});
