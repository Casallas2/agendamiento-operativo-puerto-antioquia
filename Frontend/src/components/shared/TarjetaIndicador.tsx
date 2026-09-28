import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TarjetaIndicadorProps {
  titulo: string;
  valor: string | number;
  detalle?: string;
  Icono: LucideIcon;
  cargando?: boolean;
  destacado?: 'alerta' | 'exito';
  /** Tono del pie: verde si la cifra mejora, ámbar si empeora, neutro si solo informa */
  tonoDetalle?: 'positivo' | 'negativo' | 'neutro';
}

export const TarjetaIndicador = ({
  titulo,
  valor,
  detalle,
  Icono,
  cargando,
  destacado,
  tonoDetalle = 'neutro',
}: TarjetaIndicadorProps) => (
  <div className="flex flex-col overflow-hidden rounded-xl border bg-card transition-colors duration-200 hover:border-foreground/15">
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md',
            destacado === 'alerta' && 'bg-warning/15 text-amber-700 dark:text-warning',
            destacado === 'exito' && 'bg-success/12 text-success',
            !destacado && 'bg-primary/10 text-primary',
          )}
        >
          <Icono className="size-4" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">{titulo}</p>
      </div>

      {cargando ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <p className="font-heading text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
          {valor}
        </p>
      )}
    </div>

    {/* Pie separado por una línea: el contexto de la cifra, no la cifra */}
    {detalle && (
      <div className="border-t px-4 py-2.5">
        <p
          className={cn(
            'text-xs',
            tonoDetalle === 'positivo' && 'text-success',
            tonoDetalle === 'negativo' && 'text-amber-700 dark:text-warning',
            tonoDetalle === 'neutro' && 'text-muted-foreground',
          )}
        >
          {detalle}
        </p>
      </div>
    )}
  </div>
);
