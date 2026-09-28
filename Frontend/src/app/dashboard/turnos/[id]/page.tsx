import type { Metadata } from 'next';
import { DetalleTurnoView } from '@/modules/dashboard/turnos/views/DetalleTurnoView';

export const metadata: Metadata = {
  title: 'Detalle del turno',
};

export default async function DetalleTurnoPage({ params }: PageProps<'/dashboard/turnos/[id]'>) {
  const { id } = await params;
  return <DetalleTurnoView turnoId={id} />;
}
