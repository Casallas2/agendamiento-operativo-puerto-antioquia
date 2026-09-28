'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePrefiereMenosMovimiento } from '@/hooks/usePrefiereMenosMovimiento';
import { cn } from '@/lib/utils';

const MILISEGUNDOS_POR_LAMINA = 6500;

interface Lamina {
  imagen: string;
  alt: string;
  titulo: string;
}

const LAMINAS: Lamina[] = [
  {
    imagen: '/puerto/01-muelle-amanecer.svg',
    alt: 'Grúas pórtico y un buque portacontenedores operando en el muelle al amanecer',
    titulo: 'Cada tractocamión con su hora',
  },
  {
    imagen: '/puerto/03-via-turbo.svg',
    alt: 'Tractocamión de carga avanzando por la vía de acceso al puerto entre plataneras',
    titulo: 'Sin colas en la vía a Turbo',
  },
  {
    imagen: '/puerto/04-banano-exportacion.svg',
    alt: 'Estibas de cajas de banano listas para exportación frente a un contenedor refrigerado',
    titulo: 'La carga no espera al papeleo',
  },
  {
    imagen: '/puerto/02-patio-contenedores.svg',
    alt: 'Patio de contenedores apilados bajo el cielo despejado del mediodía',
    titulo: 'Un patio que respira',
  },
];

/**
 * Carrusel de fondo del acceso a la plataforma. Sin indicadores, flechas ni botón de pausa:
 * la imagen es ambiente, no algo que haya que navegar.
 *
 * Reason: sin control visible, las dos formas de detener el avance son pasar el puntero por
 * encima y la preferencia de movimiento reducido del sistema.
 */
export const CarruselPuerto = () => {
  const [indice, setIndice] = useState(0);
  const [detenidoPorPuntero, setDetenidoPorPuntero] = useState(false);
  const prefiereMenosMovimiento = usePrefiereMenosMovimiento();

  const avanzaSolo = !detenidoPorPuntero && !prefiereMenosMovimiento;

  useEffect(() => {
    if (!avanzaSolo) {
      return undefined;
    }
    const temporizador = window.setInterval(
      () => setIndice((actual) => (actual + 1) % LAMINAS.length),
      MILISEGUNDOS_POR_LAMINA,
    );
    return () => window.clearInterval(temporizador);
  }, [avanzaSolo]);

  const lamina = LAMINAS[indice];

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Imágenes de la operación de Puerto Antioquia"
      className="relative isolate size-full overflow-hidden bg-lienzo-oscuro"
      onMouseEnter={() => setDetenidoPorPuntero(true)}
      onMouseLeave={() => setDetenidoPorPuntero(false)}
    >
      {LAMINAS.map((actual, posicion) => {
        const esActiva = posicion === indice;
        return (
          <div
            key={actual.imagen}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              esActiva ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={!esActiva}
          >
            <Image
              src={actual.imagen}
              alt={esActiva ? actual.alt : ''}
              fill
              unoptimized
              priority={posicion === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={cn(
                'object-cover',
                esActiva && avanzaSolo && 'motion-safe:animate-[deriva-lenta_9s_ease-out_both]',
              )}
            />
          </div>
        );
      })}

      {/* Velo que garantiza contraste del texto sobre cualquier lámina */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-lienzo-oscuro via-lienzo-oscuro/70 to-lienzo-oscuro/20"
      />

      <div className="relative flex size-full flex-col justify-end p-12">
        {/* `key` fuerza que la animación de entrada vuelva a correr en cada cambio */}
        <h2
          key={lamina.titulo}
          className="animar-entrada max-w-sm font-heading text-3xl leading-tight font-semibold text-white text-balance"
        >
          {lamina.titulo}
        </h2>
      </div>

    </div>
  );
};
