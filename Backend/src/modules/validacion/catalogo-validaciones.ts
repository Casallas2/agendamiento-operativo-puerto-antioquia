import type { DefinicionValidacion } from './types';

/**
 * Catálogo de validaciones pre-arribo (RF-02). Cada entrada indica el sistema externo
 * consultado a través de su adaptador. Espejo de `CATALOGO_VALIDACIONES` en el frontend.
 */
export const CATALOGO_VALIDACIONES: DefinicionValidacion[] = [
  { tipo: 'MANIFIESTO_DIAN', etiqueta: 'Manifiesto de carga', fuente: 'DIAN · SOAP/XML' },
  { tipo: 'BL_OPERADOR', etiqueta: 'Conocimiento de embarque (BL)', fuente: 'Operador portuario · REST' },
  { tipo: 'LICENCIA_RUNT', etiqueta: 'Licencia de conducción', fuente: 'RUNT · vía operador' },
  { tipo: 'SOAT', etiqueta: 'SOAT del vehículo', fuente: 'RUNT · vía operador' },
  { tipo: 'TECNOMECANICA', etiqueta: 'Revisión técnico-mecánica', fuente: 'RUNT · vía operador' },
];
