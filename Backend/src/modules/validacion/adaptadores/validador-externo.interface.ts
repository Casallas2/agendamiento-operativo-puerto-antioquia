import type { Conductor, Vehiculo } from 'src/modules/flota/entities';
import type { DocumentoCarga, DocumentoVehiculo, ResultadoValidacion } from '../types';

/**
 * Contrato unificado IValidadorExterno (Figura 3 del diseño, patrón Adapter).
 * El servicio de validación habla solo este lenguaje; cada adaptador traduce al
 * protocolo real de su sistema (SOAP/XML en la DIAN, REST/JSON en el operador).
 */
export interface ValidadorExterno {
  validarDocumentoCarga(documento: DocumentoCarga): Promise<ResultadoValidacion>;
  validarConductor(conductor: Conductor, fechaTurno: Date): Promise<ResultadoValidacion>;
  validarVehiculo(
    vehiculo: Vehiculo,
    documento: DocumentoVehiculo,
    fechaTurno: Date,
  ): Promise<ResultadoValidacion>;
}

/** Latencia simulada de los sistemas externos, que son notoriamente lentos */
export const simularLatencia = (milisegundos: number): Promise<void> =>
  new Promise((resolver) => setTimeout(resolver, milisegundos));
