import type { Metadata } from 'next';
import { LoginView } from '@/modules/auth/views/LoginView';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Ingreso con doble factor a la plataforma de agendamiento de Puerto Antioquia',
};

export default function LoginPage() {
  return <LoginView />;
}
