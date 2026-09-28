import type { Muelle } from './entities';
import type { MuelleData } from './types';

export const mapearMuelle = (muelle: Muelle): MuelleData => ({
  id: muelle.id,
  nombre: muelle.nombre,
  tipoCarga: muelle.tipoCarga,
  estado: muelle.estado,
  retrasoMinutos: muelle.retrasoMinutos,
  motivoNovedad: muelle.motivoNovedad ?? undefined,
  capacidadPorFranja: muelle.capacidadPorFranja,
});
