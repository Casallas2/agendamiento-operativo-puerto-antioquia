import { Anchor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NOMBRE_PLATAFORMA, SUBTITULO_PLATAFORMA } from '@/core/config/catalogos';

interface LogoProps {
  className?: string;
  variante?: 'claro' | 'oscuro';
  /**
   * Para cabeceras estrechas: el nombre competía por el ancho con los botones de acción y
   * terminaba partido en varias líneas. Con `compacto` solo queda el ancla y el nombre
   * reaparece desde `sm`, donde ya hay espacio de sobra.
   */
  compacto?: boolean;
}

export const Logo = ({ className, variante = 'oscuro', compacto = false }: LogoProps) => (
  <div className={cn('flex shrink-0 items-center gap-2.5', className)}>
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-slate-900 shadow-sm">
      <Anchor className="size-5" aria-hidden />
      {/* El nombre sigue anunciándose aunque no se dibuje */}
      {compacto && <span className="sr-only sm:hidden">{NOMBRE_PLATAFORMA}</span>}
    </span>
    <span className={cn('flex flex-col leading-tight whitespace-nowrap', compacto && 'hidden sm:flex')}>
      <span className={cn('text-sm font-semibold', variante === 'claro' ? 'text-white' : 'text-foreground')}>
        {NOMBRE_PLATAFORMA}
      </span>
      <span className={cn('text-xs', variante === 'claro' ? 'text-white/70' : 'text-muted-foreground')}>
        {SUBTITULO_PLATAFORMA}
      </span>
    </span>
  </div>
);
