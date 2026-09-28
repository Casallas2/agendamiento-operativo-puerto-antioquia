import type { Conductor, Vehiculo } from '@/modules/dashboard/flota/types/flota.types';
import type { Muelle } from '@/modules/dashboard/muelles/types/muelles.types';
import type { TurnoDetallado } from '@/modules/dashboard/turnos/types/turnos.types';

export interface ResumenConductor {
  conductor: Conductor;
  vehiculo: Vehiculo | null;
  muelle: Muelle | null;
  turnoActual: TurnoDetallado | null;
  proximosTurnos: TurnoDetallado[];
}

export type ComandoVoz = 'TURNO' | 'DOCUMENTOS' | 'AVISOS' | 'EN_CAMINO' | 'NOVEDAD' | 'AYUDA';
