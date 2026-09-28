import type { Metadata } from 'next';
import { FlotaView } from '@/modules/dashboard/flota/views/FlotaView';

export const metadata: Metadata = {
  title: 'Flota y documentos',
};

export default function FlotaPage() {
  return <FlotaView />;
}
