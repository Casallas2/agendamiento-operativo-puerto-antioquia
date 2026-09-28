'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface OpcionAlerta {
  valor: string;
  etiqueta: string;
  descripcion?: string;
}

interface ContenidoSeleccionAlertaProps {
  texto: string;
  opciones: OpcionAlerta[];
  valorInicial?: string;
  /** Reason: SweetAlert lee el valor en preConfirm, fuera del árbol de React */
  alCambiar: (valor: string) => void;
}

/** Opciones grandes y tocables: el conductor elige sin escribir (R-01) */
export const ContenidoSeleccionAlerta = ({ texto, opciones, valorInicial, alCambiar }: ContenidoSeleccionAlertaProps) => {
  const [valorSeleccionado, setValorSeleccionado] = useState(valorInicial ?? '');

  const seleccionarOpcion = (valor: string) => {
    setValorSeleccionado(valor);
    alCambiar(valor);
  };

  return (
    <div className="space-y-4 text-left">
      <p className="text-sm text-muted-foreground">{texto}</p>
      <RadioGroup value={valorSeleccionado} onValueChange={(valor) => seleccionarOpcion(String(valor))} aria-label={texto}>
        {opciones.map((opcion) => {
          const idOpcion = `opcion-alerta-${opcion.valor.replace(/\W+/g, '-')}`;
          return (
            <Label
              key={opcion.valor}
              htmlFor={idOpcion}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-base font-normal transition-colors hover:bg-muted/60',
                valorSeleccionado === opcion.valor && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={idOpcion} value={opcion.valor} className="size-5" />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{opcion.etiqueta}</span>
                {opcion.descripcion && <span className="text-xs text-muted-foreground">{opcion.descripcion}</span>}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};
