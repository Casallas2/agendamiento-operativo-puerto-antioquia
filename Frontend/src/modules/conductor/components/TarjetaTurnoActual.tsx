'use client';

import { differenceInMinutes } from 'date-fns';
import { AlertTriangle, CalendarX2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { InsigniaCargaRefrigerada, InsigniaEstadoTurno } from '@/components/shared/InsigniaEstado';
import { formatearDiaRelativo, formatearHora } from '@/lib/formatos';
import type { TurnoDetallado } from '@/modules/dashboard/turnos/types/turnos.types';

export const describirTiempoRestante = (turno: TurnoDetallado, ahora = new Date()) => {
  const inicioReal = new Date(new Date(turno.inicio).getTime() + turno.retrasoMinutos * 60000);
  const minutos = differenceInMinutes(inicioReal, ahora);
  if (minutos <= 0) {
    return 'Tu ventana está abierta';
  }
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  if (horas >= 24) {
    return `Faltan ${Math.floor(horas / 24)} día(s)`;
  }
  return horas > 0 ? `Faltan ${horas} h ${minutosRestantes} min` : `Faltan ${minutosRestantes} min`;
};

export const TarjetaTurnoActual = ({ turno }: { turno: TurnoDetallado | null }) => {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 30 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (!turno) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-10 text-center">
        <CalendarX2 className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-2xl font-semibold">No tienes turnos activos</p>
        <p className="text-lg text-muted-foreground">Tu transportista te avisará cuando agende uno.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="titulo-turno" className="overflow-hidden rounded-xl border bg-card">
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="titulo-turno" className="text-sm text-muted-foreground">
            Tu turno <span className="font-mono text-foreground">{turno.codigo}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {turno.cargaRefrigerada && <InsigniaCargaRefrigerada tamano="grande" />}
            <InsigniaEstadoTurno estado={turno.estado} tamano="grande" />
          </div>
        </div>

        {/* La hora es el dato que el conductor lee de reojo: todo lo demás le cede espacio */}
        <div>
          <p className="text-base text-muted-foreground">{formatearDiaRelativo(turno.inicio)}</p>
          <p className="font-heading text-6xl leading-none font-semibold tracking-tight tabular-nums sm:text-7xl">
            {formatearHora(turno.inicio, turno.retrasoMinutos)}
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            hasta las {formatearHora(turno.fin, turno.retrasoMinutos)}
          </p>
        </div>

        {turno.retrasoMinutos > 0 && (
          <Alert className="items-center rounded-lg border-warning/30 bg-warning/10 px-4 py-3">
            <AlertTriangle className="size-5 text-amber-700 dark:text-warning" aria-hidden />
            <AlertTitle className="text-base font-medium text-amber-800 dark:text-warning">
              El muelle tiene retraso: tu hora se movió {turno.retrasoMinutos} minutos
            </AlertTitle>
          </Alert>
        )}
      </div>

      {/* Pie separado, igual que en las tarjetas de indicador del panel */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t bg-muted/40 px-5 py-3.5">
        <span className="flex items-center gap-2 text-base font-medium">
          <MapPin className="size-[18px] text-primary" aria-hidden />
          {turno.nombreMuelle}
        </span>
        <span className="font-mono text-base text-muted-foreground">{turno.placa}</span>
        <span className="ml-auto text-base font-semibold text-primary tabular-nums">
          {describirTiempoRestante(turno, ahora)}
        </span>
      </div>
    </section>
  );
};
