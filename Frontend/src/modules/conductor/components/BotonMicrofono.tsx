'use client';

import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BotonMicrofonoProps {
  estaEscuchando: boolean;
  esCompatible: boolean;
  ultimaTranscripcion: string;
  mensajeEstado: string;
  alIniciar: () => void;
  alDetener: () => void;
}

export const BotonMicrofono = ({
  estaEscuchando,
  esCompatible,
  ultimaTranscripcion,
  mensajeEstado,
  alIniciar,
  alDetener,
}: BotonMicrofonoProps) => (
  <section aria-label="Comandos de voz" className="rounded-xl border bg-card p-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={estaEscuchando ? alDetener : alIniciar}
        disabled={!esCompatible}
        aria-pressed={estaEscuchando}
        aria-label={estaEscuchando ? 'Detener escucha' : 'Hablar con el asistente de voz'}
        className={cn(
          'relative flex size-24 items-center justify-center rounded-full text-white transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
          'disabled:bg-muted-foreground/40 disabled:text-background',
          estaEscuchando ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90',
        )}
      >
        {estaEscuchando && (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30" aria-hidden />
        )}
        {!esCompatible ? (
          <MicOff className="size-9" aria-hidden />
        ) : estaEscuchando ? (
          <Square className="size-8" aria-hidden />
        ) : (
          <Mic className="size-9" aria-hidden />
        )}
      </button>

      <div className="space-y-1.5">
        <p className="font-heading text-lg font-semibold">
          {estaEscuchando ? 'Te escucho…' : 'Toca y habla'}
        </p>
        <p className="text-base text-muted-foreground text-pretty">
          {esCompatible
            ? 'Di: «mi turno», «documentos», «avisos», «voy en camino» o «novedad».'
            : 'Tu navegador no permite comandos de voz. Usa Chrome o Edge, o los botones grandes.'}
        </p>
        {ultimaTranscripcion && (
          <p className="text-sm text-muted-foreground">
            Escuché: <span className="font-medium text-foreground">«{ultimaTranscripcion}»</span>
          </p>
        )}
        {/* El fallo también se ve, no solo se oye: en cabina puede haber ruido o el volumen bajo */}
        {mensajeEstado && (
          <p
            role="status"
            className="rounded-lg bg-warning/10 px-3 py-2 text-base font-medium text-amber-800 dark:text-warning"
          >
            {mensajeEstado}
          </p>
        )}
      </div>
    </div>
  </section>
);
