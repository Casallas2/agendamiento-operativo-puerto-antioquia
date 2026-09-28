import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { Logo } from '@/components/shared/Logo';

/**
 * Portada: una sola pantalla con una sola acción.
 * Reason: todo lo que explicaba roles y capacidades se eliminó porque el usuario lo descubre
 * al entrar; aquí competía con el único botón que importa y obligaba a desplazarse.
 */
export default function InicioPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-1 flex-col overflow-hidden bg-lienzo-oscuro text-white">
      <Image
        src="/puerto/01-muelle-amanecer.svg"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      {/* Velo que asegura el contraste del texto sobre la imagen */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-lienzo-oscuro via-lienzo-oscuro/85 to-lienzo-oscuro/45"
      />

      <header className="relative mx-auto flex w-full max-w-6xl items-center px-6 py-7">
        <Logo variante="claro" />
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-16">
        <div className="animar-entrada max-w-xl space-y-7">
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold text-balance sm:text-6xl">
            Menos filas en la vía, más carga en movimiento.
          </h1>
          <p className="text-lg leading-relaxed text-white/75 text-pretty">
            Agendamiento de turnos para el ingreso de tractocamiones a Puerto Antioquia.
          </p>
          <EnlaceBoton
            href="/login"
            size="lg"
            className="h-12 bg-white px-6 text-base text-slate-900 hover:bg-white/90"
          >
            Entrar
            <ArrowRight aria-hidden />
          </EnlaceBoton>
        </div>
      </main>

      <footer className="relative mx-auto w-full max-w-6xl px-6 pb-7">
        <p className="text-xs text-white/50">
          Prototipo académico · Ingeniería de Software II · Uniremington ·{' '}
          <Link
            href="/proyecto"
            className="underline underline-offset-4 transition-colors hover:text-white/80"
          >
            Backlog y diseño UX
          </Link>
        </p>
      </footer>
    </div>
  );
}
