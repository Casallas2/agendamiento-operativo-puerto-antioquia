'use client';

import { AlertTriangle, Bell, BellOff, CheckCircle2, Info, MessageSquare, Mic, Smartphone, XCircle, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AyudaEmergente } from '@/components/shared/AyudaEmergente';
import { EstadoVacio } from '@/components/shared/EstadoVacio';
import { useUiStore } from '@/core/store/uiStore';
import { formatearTiempoRelativo } from '@/lib/formatos';
import { cn } from '@/lib/utils';
import { useGetNotificaciones, useMarcarNotificacionesLeidas } from '../hooks/useNotificaciones';
import type { CanalNotificacion, Notificacion, TipoNotificacion } from '../types/notificaciones.types';

const ICONO_TIPO: Record<TipoNotificacion, { Icono: LucideIcon; clase: string }> = {
  INFO: { Icono: Info, clase: 'text-info bg-info/10' },
  EXITO: { Icono: CheckCircle2, clase: 'text-success bg-success/12' },
  ALERTA: { Icono: AlertTriangle, clase: 'text-amber-700 bg-warning/15 dark:text-warning' },
  ERROR: { Icono: XCircle, clase: 'text-destructive bg-destructive/10' },
};

const ICONO_CANAL: Record<CanalNotificacion, { Icono: LucideIcon; etiqueta: string }> = {
  PUSH: { Icono: Smartphone, etiqueta: 'Push' },
  SMS: { Icono: MessageSquare, etiqueta: 'SMS' },
  VOZ: { Icono: Mic, etiqueta: 'Voz' },
};

export const ElementoNotificacion = ({ notificacion, rutaTurno }: { notificacion: Notificacion; rutaTurno?: string }) => {
  const { Icono, clase } = ICONO_TIPO[notificacion.tipo];
  return (
    <li className={cn('flex gap-3 rounded-lg p-3', !notificacion.leida && 'bg-primary/5')}>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', clase)}>
        <Icono className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{notificacion.titulo}</p>
          {!notificacion.leida && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
        </div>
        <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatearTiempoRelativo(notificacion.creadaEn)}</span>
          <span className="flex items-center gap-1.5" title="Canales por los que se entregó (patrón Observer)">
            {notificacion.canales.map((canal) => {
              const { Icono: IconoCanal, etiqueta } = ICONO_CANAL[canal];
              return (
                <span key={canal} className="inline-flex items-center gap-0.5">
                  <IconoCanal className="size-3" aria-hidden />
                  {etiqueta}
                </span>
              );
            })}
          </span>
          {rutaTurno && notificacion.turnoId && (
            <Link href={`${rutaTurno}/${notificacion.turnoId}`} className="font-medium text-primary hover:underline">
              Ver turno
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

export const PanelNotificaciones = () => {
  const [estaAbierto, setEstaAbierto] = useState(false);
  const { data: notificaciones = [], isLoading } = useGetNotificaciones();
  const { mutate: marcarLeidas } = useMarcarNotificacionesLeidas();
  const cantidadSinLeer = notificaciones.filter((notificacion) => !notificacion.leida).length;
  const avisosEmergentesActivos = useUiStore((estado) => estado.avisosEmergentesActivos);
  const cambiarAvisosEmergentes = useUiStore((estado) => estado.cambiarAvisosEmergentes);

  const cambiarApertura = (abrir: boolean) => {
    setEstaAbierto(abrir);
    if (!abrir && cantidadSinLeer > 0) {
      marcarLeidas();
    }
  };

  return (
    <>
      <AyudaEmergente texto="Notificaciones">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => cambiarApertura(true)}
          aria-label={`Notificaciones, ${cantidadSinLeer} sin leer`}
        >
          <Bell aria-hidden />
          {cantidadSinLeer > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 bg-destructive px-1 text-[10px] text-white tabular-nums">{cantidadSinLeer}</Badge>
          )}
        </Button>
      </AyudaEmergente>
      <Sheet open={estaAbierto} onOpenChange={cambiarApertura}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>Notificaciones</SheetTitle>
            <SheetDescription>Avisos en tiempo real sobre turnos, muelles y validaciones.</SheetDescription>
            <Label htmlFor="avisosEmergentes" className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 font-normal">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">Avisos emergentes</span>
                <span className="text-xs text-muted-foreground">Mostrar cada notificación en la esquina de la pantalla.</span>
              </span>
              <Switch id="avisosEmergentes" checked={avisosEmergentesActivos} onCheckedChange={cambiarAvisosEmergentes} />
            </Label>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {isLoading && (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((indice) => (
                  <Skeleton key={indice} className="h-20 w-full" />
                ))}
              </div>
            )}
            {!isLoading && notificaciones.length === 0 && (
              <div className="p-2">
                <EstadoVacio Icono={BellOff} titulo="Sin notificaciones" descripcion="Cuando algo cambie en tus turnos te avisaremos aquí." />
              </div>
            )}
            <ul className="space-y-1">
              {notificaciones.map((notificacion) => (
                <ElementoNotificacion key={notificacion.id} notificacion={notificacion} rutaTurno="/dashboard/turnos" />
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
