import type { Metadata } from 'next';
import { ConductorView } from '@/modules/conductor/views/ConductorView';

export const metadata: Metadata = {
  title: 'Mi turno',
  description: 'Vista de cabina para el conductor: turno, avisos y comandos de voz',
};

export default function ConductorPage() {
  return <ConductorView />;
}
