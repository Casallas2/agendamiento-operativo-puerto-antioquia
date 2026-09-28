'use client';

import { ArrowRight, CalendarPlus, ClipboardList, Ship } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { EstadoVacio } from '@/components/shared/EstadoVacio';
import { InsigniaEstadoMuelle, InsigniaEstadoTurno } from '@/components/shared/InsigniaEstado';
import { ESTADOS_TURNO_ACTIVOS } from '@/core/config/catalogos';
import { useAuthStore } from '@/core/store/authStore';
import { formatearDiaRelativo, formatearVentana } from '@/lib/formatos';
import { IndicadoresOperacion } from '@/modules/dashboard/alertas/components/IndicadoresOperacion';
import { useGetReporte } from '@/modules/dashboard/alertas/hooks/useReporte';
import { useGetMuelles } from '@/modules/dashboard/muelles/hooks/useMuelles';
import { useGetTurnos } from '@/modules/dashboard/turnos/hooks/useTurnos';

const MAXIMO_TURNOS_RESUMEN = 5;

const obtenerSaludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) {
    return 'Buenos días';
  }
  return hora < 19 ? 'Buenas tardes' : 'Buenas noches';
};

export const ResumenView = () => {
  const usuario = useAuthStore((estado) => estado.user);
  const esOperador = usuario?.rol === 'OPERADOR_PORTUARIO';
  const { data: reporte, isLoading: cargandoReporte } = useGetReporte();
  const { data: turnos = [], isLoading: cargandoTurnos } = useGetTurnos();
  const { data: muelles = [] } = useGetMuelles();
  const turnosActivos = turnos.filter((turno) => ESTADOS_TURNO_ACTIVOS.includes(turno.estado)).slice(0, MAXIMO_TURNOS_RESUMEN);

  return (
    <>
      <EncabezadoPagina
        titulo={`${obtenerSaludo()}, ${usuario?.nombre.split(' ')[0] ?? ''}`}
        descripcion={esOperador ? 'Así va la operación del puerto en este momento.' : `Resumen de ${usuario?.empresaNombre ?? 'tu empresa'}.`}
        acciones={
          esOperador ? (
            <EnlaceBoton href="/dashboard/muelles" size="lg">
              <Ship aria-hidden />
              Gestionar muelles
            </EnlaceBoton>
          ) : (
            <EnlaceBoton href="/dashboard/turnos/nuevo" size="lg">
              <CalendarPlus aria-hidden />
              Reservar turno
            </EnlaceBoton>
          )
        }
      />
      <IndicadoresOperacion indicadores={reporte?.indicadores} cargando={cargandoReporte} esOperador={esOperador} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Próximos turnos</CardTitle>
              <CardDescription>Ordenados por ventana de ingreso.</CardDescription>
            </div>
            <Link href="/dashboard/turnos" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent>
            {cargandoTurnos && <Skeleton className="h-48" />}
            {!cargandoTurnos && turnosActivos.length === 0 && (
              <EstadoVacio Icono={ClipboardList} titulo="Sin turnos activos" descripcion="Cuando reserves un turno aparecerá aquí." />
            )}
            <ul className="divide-y">
              {turnosActivos.map((turno) => (
                <li key={turno.id}>
                  <Link
                    href={`/dashboard/turnos/${turno.id}`}
                    className="-mx-2 flex flex-col gap-2 rounded-lg px-2 py-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        <span className="font-mono">{turno.codigo}</span> · {turno.placa} · {turno.nombreConductor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatearDiaRelativo(turno.inicio)}, {formatearVentana(turno.inicio, turno.fin, turno.retrasoMinutos)} · {turno.nombreMuelle}
                      </p>
                    </div>
                    <InsigniaEstadoTurno estado={turno.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Estado de muelles</CardTitle>
            <CardDescription>Actualizado en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {muelles.map((muelle) => (
                <li key={muelle.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{muelle.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {muelle.estado === 'RETRASADO' ? `+${muelle.retrasoMinutos} min · ` : ''}
                      {muelle.tipoCarga}
                    </p>
                  </div>
                  <InsigniaEstadoMuelle estado={muelle.estado} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
