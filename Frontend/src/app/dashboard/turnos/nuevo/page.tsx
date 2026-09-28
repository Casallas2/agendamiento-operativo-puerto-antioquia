import type { Metadata } from 'next';
import { CrearTurnoView } from '@/modules/dashboard/turnos/views/CrearTurnoView';

export const metadata: Metadata = {
  title: 'Reservar turno',
};

export default function CrearTurnoPage() {
  return <CrearTurnoView />;
}
