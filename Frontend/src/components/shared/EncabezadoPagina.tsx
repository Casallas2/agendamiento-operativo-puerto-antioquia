import type { ReactNode } from 'react';

interface EncabezadoPaginaProps {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

export const EncabezadoPagina = ({ titulo, descripcion, acciones }: EncabezadoPaginaProps) => (
  <div className="animar-entrada flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">{titulo}</h1>
      {descripcion && <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{descripcion}</p>}
    </div>
    {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
  </div>
);
