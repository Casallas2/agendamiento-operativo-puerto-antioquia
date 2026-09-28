import type { TipoValidacion } from 'src/common/types/dominio.type';

export type ResultadoValidacion = {
  aprobado: boolean;
  mensaje: string;
};

export type DocumentoCarga = {
  numeroManifiesto: string;
  numeroBl: string;
};

export type DocumentoVehiculo = 'SOAT' | 'TECNOMECANICA';

/** Definición de cada validación del catálogo y el sistema externo que la resuelve */
export type DefinicionValidacion = {
  tipo: TipoValidacion;
  etiqueta: string;
  fuente: string;
};

export const construirResultado = (aprobado: boolean, mensaje: string): ResultadoValidacion => ({
  aprobado,
  mensaje,
});
