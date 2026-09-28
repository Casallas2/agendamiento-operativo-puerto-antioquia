'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface DatosRetraso {
  minutos: number;
  motivo: string;
}

const OPCIONES_MINUTOS = [
  { valor: 30, etiqueta: '30 min' },
  { valor: 60, etiqueta: '1 hora' },
  { valor: 90, etiqueta: '1 h 30 min' },
  { valor: 120, etiqueta: '2 horas' },
];

export const LONGITUD_MAXIMA_MOTIVO = 160;

interface ContenidoRetrasoAlertaProps {
  datosIniciales: DatosRetraso;
  alCambiar: (datos: DatosRetraso) => void;
}

export const ContenidoRetrasoAlerta = ({ datosIniciales, alCambiar }: ContenidoRetrasoAlertaProps) => {
  const [datos, setDatos] = useState(datosIniciales);

  const actualizarDatos = (cambios: Partial<DatosRetraso>) => {
    const datosActualizados = { ...datos, ...cambios };
    setDatos(datosActualizados);
    alCambiar(datosActualizados);
  };

  return (
    <div className="space-y-5 text-left">
      <p className="text-sm text-muted-foreground">Se notificará de inmediato a conductores y transportistas con turno en este muelle.</p>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-foreground">¿Cuánto se desplaza la ventana?</legend>
        <RadioGroup
          value={String(datos.minutos)}
          onValueChange={(valor) => actualizarDatos({ minutos: Number(valor) })}
          className="grid-cols-2 sm:grid-cols-4"
        >
          {OPCIONES_MINUTOS.map((opcion) => (
            <Label
              key={opcion.valor}
              htmlFor={`minutos-${opcion.valor}`}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 font-normal transition-colors hover:bg-muted/60',
                datos.minutos === opcion.valor && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`minutos-${opcion.valor}`} value={String(opcion.valor)} />
              {opcion.etiqueta}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="motivoRetraso">Motivo</Label>
        <Textarea
          id="motivoRetraso"
          value={datos.motivo}
          maxLength={LONGITUD_MAXIMA_MOTIVO}
          placeholder="Ej.: buque atracando con demora"
          onChange={(evento) => actualizarDatos({ motivo: evento.target.value })}
        />
        <p className="text-right text-xs text-muted-foreground tabular-nums">
          {datos.motivo.length}/{LONGITUD_MAXIMA_MOTIVO}
        </p>
      </div>
    </div>
  );
};
