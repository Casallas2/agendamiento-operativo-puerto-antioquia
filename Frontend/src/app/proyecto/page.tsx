import type { Metadata } from 'next';
import { ProyectoView } from '@/modules/proyecto/views/ProyectoView';

export const metadata: Metadata = {
  title: 'Backlog Scrum y diseño UX',
  description: 'Product Backlog, sprints y justificación de diseño de la plataforma de agendamiento',
};

export default function ProyectoPage() {
  return <ProyectoView />;
}
