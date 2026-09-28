import type { Metadata } from 'next';
import { AlertasView } from '@/modules/dashboard/alertas/views/AlertasView';

export const metadata: Metadata = {
  title: 'Alertas y reportes',
};

export default function AlertasPage() {
  return <AlertasView />;
}
