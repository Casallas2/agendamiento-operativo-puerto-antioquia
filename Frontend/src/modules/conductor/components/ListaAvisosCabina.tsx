import { forwardRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { formatearTiempoRelativo } from '@/lib/formatos';
import { cn } from '@/lib/utils';
import type { Notificacion } from '@/modules/notificaciones/types/notificaciones.types';

/** Icono sobre pastilla de color suave, igual que en las tarjetas de indicador */
const ICONOS = {
  INFO: { Icono: Info, clase: 'bg-info/10 text-info' },
  EXITO: { Icono: CheckCircle2, clase: 'bg-success/12 text-success' },
  ALERTA: { Icono: AlertTriangle, clase: 'bg-warning/15 text-amber-700 dark:text-warning' },
  ERROR: { Icono: XCircle, clase: 'bg-destructive/10 text-destructive' },
};

interface ListaAvisosCabinaProps {
  avisos: Notificacion[];
}

export const ListaAvisosCabina = forwardRef<HTMLElement, ListaAvisosCabinaProps>(({ avisos }, ref) => (
  <section ref={ref} aria-labelledby="titulo-avisos" className="scroll-mt-24 space-y-3" tabIndex={-1}>
    <h2 id="titulo-avisos" className="font-heading text-lg font-semibold">
      Últimos avisos
    </h2>
    {avisos.length === 0 && (
      <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
        No tienes avisos nuevos.
      </p>
    )}
    <ul className="space-y-2" aria-live="polite">
      {avisos.map((aviso) => {
        const { Icono, clase } = ICONOS[aviso.tipo];
        return (
          <li
            key={aviso.id}
            className={cn(
              'flex gap-4 rounded-xl border bg-card p-4 transition-colors duration-200',
              // El no leído se marca con el borde, no con un fondo que compita con el texto
              !aviso.leida && 'border-primary/40',
            )}
          >
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', clase)}>
              <Icono className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-base leading-snug font-medium">{aviso.titulo}</p>
              <p className="text-base text-muted-foreground">{aviso.mensaje}</p>
              <p className="text-sm text-muted-foreground">{formatearTiempoRelativo(aviso.creadaEn)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
));

ListaAvisosCabina.displayName = 'ListaAvisosCabina';
