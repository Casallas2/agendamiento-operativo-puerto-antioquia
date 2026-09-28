export type EstadoMuelle = 'OPERATIVO' | 'RETRASADO' | 'MANTENIMIENTO';

export interface Muelle {
  id: string;
  nombre: string;
  tipoCarga: string;
  estado: EstadoMuelle;
  retrasoMinutos: number;
  motivoNovedad?: string;
  capacidadPorFranja: number;
}

export interface RetrasoMuellePayload {
  muelleId: string;
  minutos: number;
  motivo: string;
}
