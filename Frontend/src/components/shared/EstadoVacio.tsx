import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EstadoVacioProps {
  Icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export const EstadoVacio = ({ Icono, titulo, descripcion, accion }: EstadoVacioProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icono className="size-6" aria-hidden />
    </span>
    <div className="space-y-1">
      <p className="font-medium">{titulo}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>
    </div>
    {accion}
  </div>
);
