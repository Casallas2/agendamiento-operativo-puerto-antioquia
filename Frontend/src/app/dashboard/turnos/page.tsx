import type { Metadata } from 'next';
import { TurnosView } from '@/modules/dashboard/turnos/views/TurnosView';

export const metadata: Metadata = {
  title: 'Turnos',
};

export default function TurnosPage() {
  return <TurnosView />;
}
