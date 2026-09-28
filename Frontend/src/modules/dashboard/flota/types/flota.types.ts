export type EstadoRunt = 'ACTIVO' | 'SUSPENDIDO';

export interface Vehiculo {
  id: string;
  placa: string;
  tipo: string;
  marca: string;
  empresaId: string;
  estadoRunt: EstadoRunt;
  vencimientoSoat: string;
  vencimientoTecnomecanica: string;
}

export interface Conductor {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  categoriaLicencia: string;
  vencimientoLicencia: string;
  empresaId: string;
}

export type SemaforoDocumento = 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';

export interface EstadoDocumento {
  nombre: string;
  vencimiento: string;
  semaforo: SemaforoDocumento;
  diasRestantes: number;
}
