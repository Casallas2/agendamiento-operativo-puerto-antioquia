'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  detalle?: string;
  deshabilitada?: boolean;
}

interface SelectorOpcionesProps {
  id: string;
  valor: string;
  opciones: OpcionSelector[];
  alCambiar: (valor: string) => void;
  alSalir?: () => void;
  textoVacio?: string;
  invalido?: boolean;
  className?: string;
}

/**
 * Select del sistema de diseño (components/ui/select) con opciones deshabilitadas visibles:
 * el usuario ve por qué no puede elegir una opción en lugar de descubrirlo después (prevención de errores).
 */
export const SelectorOpciones = ({
  id,
  valor,
  opciones,
  alCambiar,
  alSalir,
  textoVacio = 'Selecciona una opción',
  invalido = false,
  className,
}: SelectorOpcionesProps) => (
  <Select
    items={opciones.map((opcion) => ({ value: opcion.valor, label: opcion.etiqueta }))}
    value={valor || null}
    onValueChange={(valorNuevo) => alCambiar(valorNuevo ?? '')}
  >
    <SelectTrigger id={id} aria-invalid={invalido} onBlur={alSalir} className={cn('h-10 w-full', className)}>
      <SelectValue placeholder={textoVacio} />
    </SelectTrigger>
    <SelectContent>
      {opciones.map((opcion) => (
        <SelectItem key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada} className="py-1.5">
          <span className="flex flex-col">
            <span>{opcion.etiqueta}</span>
            {opcion.detalle && (
              <span className={cn('text-xs', opcion.deshabilitada ? 'text-destructive' : 'text-muted-foreground')}>{opcion.detalle}</span>
            )}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
