import Link from 'next/link';
import { CarruselPuerto } from '@/components/shared/CarruselPuerto';
import { Logo } from '@/components/shared/Logo';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Panel visual: solo en pantallas grandes, donde no compite con el formulario */}
      <section className="relative hidden lg:block">
        <CarruselPuerto />
      </section>

      {/* En móvil solo queda el formulario: cualquier otra cosa lo empuja fuera de la pantalla */}
      <section className="flex flex-col items-center justify-center gap-10 px-4 py-10 sm:px-8">
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
