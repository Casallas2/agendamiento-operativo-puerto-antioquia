import type { Metadata } from 'next';
import { MuellesView } from '@/modules/dashboard/muelles/views/MuellesView';

export const metadata: Metadata = {
  title: 'Muelles',
};

export default function MuellesPage() {
  return <MuellesView />;
}
