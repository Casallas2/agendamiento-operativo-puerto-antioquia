'use client';

import { addDays, format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Snowflake, Wrench } from 'lucide-react';
import { useAhora } from '@/hooks/useAhora';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InsigniaEstadoMuelle } from '@/components/shared/InsigniaEstado';
import { formatearHora } from '@/lib/formatos';
import { cn } from '@/lib/utils';
import { useGetMuelles } from '@/modules/dashboard/muelles/hooks/useMuelles';
import { useGetFranjas } from '../hooks/useTurnos';
import type { Franja } from '../types/turnos.types';

const DIAS_DISPONIBLES = 7;

interface SelectorFranjaProps {
  fecha: string;
  franjaId: string;
  tipoCarga: string;
  cargaRefrigerada: boolean;
  alCambiarFecha: (fecha: string) => void;
  alSeleccionarFranja: (franja: Franja) => void;
}

/** Cupos que puede tomar este tipo de carga: la general no ve la cuota refrigerada (OCI-001) */
const contarCupos = (franja: Franja, cargaRefrigerada: boolean) =>
  cargaRefrigerada ? franja.disponibles.refrigerada : franja.disponibles.general;

const describirCupos = (franja: Franja, cargaRefrigerada: boolean) => {
  const libres = contarCupos(franja, cargaRefrigerada);
  if (libres <= 0) {
    return franja.disponibles.refrigerada > 0 ? 'Solo refrigerada' : 'Lleno';
  }
  return libres === 1 ? '1 cupo' : `${libres} cupos`;
};

export const SelectorFranja = ({
  fecha,
  franjaId,
  tipoCarga,
  cargaRefrigerada,
  alCambiarFecha,
  alSeleccionarFranja,
}: SelectorFranjaProps) => {
  const { data: franjas = [], isLoading: cargandoFranjas } = useGetFranjas(fecha);
  const { data: muelles = [], isLoading: cargandoMuelles } = useGetMuelles();
  const ahora = useAhora();
  const dias = Array.from({ length: DIAS_DISPONIBLES }, (_, indice) => addDays(startOfDay(ahora), indice));

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Día del turno" className="flex gap-2 overflow-x-auto pb-1">
        {dias.map((dia) => {
          const valorDia = format(dia, 'yyyy-MM-dd');
          const estaSeleccionado = valorDia === fecha;
          return (
            <Button
              key={valorDia}
              type="button"
              role="radio"
              aria-checked={estaSeleccionado}
              variant={estaSeleccionado ? 'default' : 'outline'}
              onClick={() => alCambiarFecha(valorDia)}
              className="h-auto min-w-16 shrink-0 flex-col gap-0 px-3 py-2"
            >
              <span className="text-xs capitalize opacity-80">{format(dia, 'EEE', { locale: es })}</span>
              <span className="text-lg font-semibold tabular-nums">{format(dia, 'd')}</span>
            </Button>
          );
        })}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Snowflake className="size-4 text-info" aria-hidden />
        {cargaRefrigerada
          ? 'Tu carga refrigerada puede usar cualquier cupo libre, incluida la cuota prioritaria.'
          : 'El 30 % de cada franja está reservado para carga refrigerada hasta 2 horas antes.'}
      </p>

      {(cargandoFranjas || cargandoMuelles) && <Skeleton className="h-48 w-full" />}

      {!cargandoFranjas && !cargandoMuelles && (
        <div className="space-y-4">
          {muelles.map((muelle) => {
            const franjasMuelle = franjas.filter((franja) => franja.muelleId === muelle.id);
            const enMantenimiento = muelle.estado === 'MANTENIMIENTO';
            const esRecomendado = tipoCarga && muelle.tipoCarga.toLowerCase().includes(tipoCarga.split(' ')[0].toLowerCase());
            return (
              <fieldset key={muelle.id} className="space-y-2" disabled={enMantenimiento}>
                <legend className="flex w-full flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{muelle.nombre}</span>
                  <span className="text-muted-foreground">· {muelle.tipoCarga}</span>
                  {esRecomendado && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Recomendado para tu carga
                    </Badge>
                  )}
                  {muelle.estado !== 'OPERATIVO' && <InsigniaEstadoMuelle estado={muelle.estado} />}
                </legend>
                {enMantenimiento ? (
                  <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Wrench className="size-4" aria-hidden />
                    {muelle.motivoNovedad ?? 'No disponible temporalmente'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {franjasMuelle.map((franja) => {
                      const estaLlena = contarCupos(franja, cargaRefrigerada) <= 0;
                      const yaPaso = new Date(franja.inicio).getTime() < ahora;
                      const estaSeleccionada = franja.id === franjaId;
                      return (
                        <Button
                          key={franja.id}
                          type="button"
                          variant={estaSeleccionada ? 'default' : 'outline'}
                          disabled={estaLlena || yaPaso}
                          onClick={() => alSeleccionarFranja(franja)}
                          aria-pressed={estaSeleccionada}
                          className="h-auto flex-col items-start gap-0 px-3 py-2 text-left disabled:bg-muted/60 disabled:line-through"
                        >
                          <span className="font-medium tabular-nums">{formatearHora(franja.inicio)}</span>
                          <span className={cn('text-xs font-normal', estaSeleccionada ? 'opacity-90' : 'text-muted-foreground')}>
                            {yaPaso ? 'Ya pasó' : describirCupos(franja, cargaRefrigerada)}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
      )}
    </div>
  );
};
