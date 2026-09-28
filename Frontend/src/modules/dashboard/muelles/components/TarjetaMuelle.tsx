'use client';

import { AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { InsigniaEstadoMuelle, InsigniaEstadoTurno } from '@/components/shared/InsigniaEstado';
import { formatearVentana } from '@/lib/formatos';
import { cn } from '@/lib/utils';
import type { TurnoDetallado } from '@/modules/dashboard/turnos/types/turnos.types';
import type { Muelle } from '../types/muelles.types';

const PORCENTAJE_OCUPACION_ALTA = 85;

interface TarjetaMuelleProps {
  muelle: Muelle;
  turnosProximos: TurnoDetallado[];
  ocupacionHoy: { ocupados: number; capacidad: number };
  estaProcesando: boolean;
  alDeclararRetraso: (muelle: Muelle) => void;
  alRestablecer: (muelle: Muelle) => void;
  alAlternarMantenimiento: (muelle: Muelle) => void;
}

export const TarjetaMuelle = ({
  muelle,
  turnosProximos,
  ocupacionHoy,
  estaProcesando,
  alDeclararRetraso,
  alRestablecer,
  alAlternarMantenimiento,
}: TarjetaMuelleProps) => {
  const porcentajeOcupacion = ocupacionHoy.capacidad ? Math.round((ocupacionHoy.ocupados / ocupacionHoy.capacidad) * 100) : 0;
  const enMantenimiento = muelle.estado === 'MANTENIMIENTO';

  return (
    <Card className={cn(muelle.estado === 'RETRASADO' && 'ring-2 ring-warning/60', enMantenimiento && 'opacity-90')}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">{muelle.nombre}</CardTitle>
          <p className="text-sm text-muted-foreground">{muelle.tipoCarga}</p>
        </div>
        <InsigniaEstadoMuelle estado={muelle.estado} />
      </CardHeader>
      <CardContent className="space-y-4">
        {muelle.motivoNovedad && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">
            {muelle.estado === 'RETRASADO' && <strong>+{muelle.retrasoMinutos} min · </strong>}
            {muelle.motivoNovedad}
          </p>
        )}
        <Progress
          value={porcentajeOcupacion}
          getAriaValueText={() => `${ocupacionHoy.ocupados} de ${ocupacionHoy.capacidad} cupos ocupados`}
          className={cn(
            'gap-1.5 [&_[data-slot=progress-track]]:h-2',
            porcentajeOcupacion >= PORCENTAJE_OCUPACION_ALTA && '[&_[data-slot=progress-indicator]]:bg-warning',
          )}
        >
          <ProgressLabel className="font-normal text-muted-foreground">Ocupación de hoy</ProgressLabel>
          <ProgressValue>{() => `${ocupacionHoy.ocupados}/${ocupacionHoy.capacidad} cupos`}</ProgressValue>
        </Progress>
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Próximos turnos</p>
          {turnosProximos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin turnos en las próximas horas.</p>
          ) : (
            <ul className="space-y-2">
              {turnosProximos.map((turno) => (
                <li key={turno.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-mono font-medium">{turno.placa}</span>{' '}
                    <span className="text-muted-foreground tabular-nums">{formatearVentana(turno.inicio, turno.fin, turno.retrasoMinutos)}</span>
                  </span>
                  <InsigniaEstadoTurno estado={turno.estado} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4 pb-4">
        {muelle.estado === 'RETRASADO' ? (
          <Button onClick={() => alRestablecer(muelle)} disabled={estaProcesando}>
            <CheckCircle2 aria-hidden />
            Restablecer operación
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-warning/60 text-amber-700 hover:bg-warning/10 dark:text-warning"
            onClick={() => alDeclararRetraso(muelle)}
            disabled={estaProcesando || enMantenimiento}
          >
            <AlertTriangle aria-hidden />
            Declarar retraso
          </Button>
        )}
        <Button variant="ghost" onClick={() => alAlternarMantenimiento(muelle)} disabled={estaProcesando}>
          <Wrench aria-hidden />
          {enMantenimiento ? 'Habilitar muelle' : 'Mantenimiento'}
        </Button>
      </CardFooter>
    </Card>
  );
};
