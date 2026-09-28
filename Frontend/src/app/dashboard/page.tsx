import type { Metadata } from 'next';
import { ResumenView } from '@/modules/dashboard/resumen/views/ResumenView';

export const metadata: Metadata = {
  title: 'Resumen',
};

export default function DashboardPage() {
  return <ResumenView />;
}
