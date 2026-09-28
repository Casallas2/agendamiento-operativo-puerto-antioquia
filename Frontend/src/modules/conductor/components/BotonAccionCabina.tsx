import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TonoBoton = 'primario' | 'alerta' | 'neutro';

/**
 * Solo la acción principal va en color sólido. Las demás son tarjetas blancas con borde fino,
 * igual que el resto del panel: el color señala qué hacer, no decora.
 */
const CLASES_TONO: Record<TonoBoton, string> = {
  primario: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
  alerta: 'border bg-card hover:border-warning/50 hover:bg-warning/5',
  neutro: 'border bg-card hover:border-foreground/20 hover:bg-muted/50',
};

const CLASES_ICONO: Record<TonoBoton, string> = {
  primario: 'bg-white/15 text-primary-foreground',
  alerta: 'bg-warning/15 text-amber-700 dark:text-warning',
  neutro: 'bg-primary/10 text-primary',
};

interface BotonAccionCabinaProps {
  etiqueta: string;
  descripcion?: string;
  Icono: LucideIcon;
  tono?: TonoBoton;
  deshabilitado?: boolean;
  alPresionar: () => void;
}

/**
 * Botón de alta visibilidad para cabina (R-01): área táctil mínima de 96 px de alto,
 * texto grande e icono, pensado para usarse con guantes o con el vehículo en vibración.
 */
export const BotonAccionCabina = ({
  etiqueta,
  descripcion,
  Icono,
  tono = 'neutro',
  deshabilitado,
  alPresionar,
}: BotonAccionCabinaProps) => (
  <button
    type="button"
    onClick={alPresionar}
    disabled={deshabilitado}
    className={cn(
      'flex min-h-24 w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-colors duration-200',
      'active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      CLASES_TONO[tono],
    )}
  >
    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-lg', CLASES_ICONO[tono])}>
      <Icono className="size-6" aria-hidden />
    </span>
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="text-lg leading-tight font-semibold">{etiqueta}</span>
      {descripcion && (
        <span className={cn('text-sm', tono === 'primario' ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
          {descripcion}
        </span>
      )}
    </span>
  </button>
);
