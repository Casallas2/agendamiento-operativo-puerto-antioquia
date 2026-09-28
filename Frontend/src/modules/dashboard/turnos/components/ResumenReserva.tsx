'use client';

import { CalendarCheck, Loader2 } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatearDiaRelativo, formatearVentana } from '@/lib/formatos';
import type { CrearTurnoFormulario } from '@/lib/validators';
import type { Franja } from '../types/turnos.types';

interface ResumenReservaProps {
  placa?: string;
  nombreConductor?: string;
  tipoCarga?: string;
  franja?: Franja;
  nombreMuelle?: string;
  estaEnviando: boolean;
}

const FilaResumen = ({ etiqueta, valor }: { etiqueta: string; valor?: string }) => (
  <div className="flex justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{etiqueta}</span>
    <span className={valor ? 'text-right font-medium' : 'text-right text-muted-foreground/70 italic'}>{valor ?? 'Pendiente'}</span>
  </div>
);

/** Resumen siempre visible: el usuario no tiene que recordar lo que eligió arriba */
export const ResumenReserva = ({ placa, nombreConductor, tipoCarga, franja, nombreMuelle, estaEnviando }: ResumenReservaProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CrearTurnoFormulario>();

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>Resumen de la reserva</CardTitle>
        <CardDescription>Revisa antes de confirmar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FilaResumen etiqueta="Vehículo" valor={placa} />
        <FilaResumen etiqueta="Conductor" valor={nombreConductor} />
        <FilaResumen etiqueta="Carga" valor={tipoCarga} />
        <Separator />
        <FilaResumen etiqueta="Día" valor={franja ? formatearDiaRelativo(franja.inicio) : undefined} />
        <FilaResumen etiqueta="Ventana" valor={franja ? formatearVentana(franja.inicio, franja.fin) : undefined} />
        <FilaResumen etiqueta="Muelle" valor={nombreMuelle} />
        <Separator />

        <div className="space-y-1.5">
          <Controller
            control={control}
            name="aceptaDeclaracion"
            render={({ field }) => (
              <Label htmlFor="aceptaDeclaracion" className="flex cursor-pointer items-start gap-2.5 text-xs leading-snug font-normal">
                <Checkbox
                  id="aceptaDeclaracion"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={Boolean(errors.aceptaDeclaracion)}
                  className="mt-0.5"
                />
                Declaro que los datos son verídicos y autorizo su consulta ante la DIAN, el RUNT y el operador portuario.
              </Label>
            )}
          />
          {errors.aceptaDeclaracion && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {errors.aceptaDeclaracion.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={estaEnviando}>
          {estaEnviando ? <Loader2 className="animate-spin" aria-hidden /> : <CalendarCheck aria-hidden />}
          {estaEnviando ? 'Reservando cupo…' : 'Reservar turno'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">El cupo se aparta de inmediato y los documentos se validan en segundo plano.</p>
      </CardContent>
    </Card>
  );
};
