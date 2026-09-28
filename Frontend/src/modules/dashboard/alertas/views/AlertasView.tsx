'use client';

import { BellOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { EstadoVacio } from '@/components/shared/EstadoVacio';
import { useAuthStore } from '@/core/store/authStore';
import { ElementoNotificacion } from '@/modules/notificaciones/components/PanelNotificaciones';
import { useGetNotificaciones } from '@/modules/notificaciones/hooks/useNotificaciones';
import { IndicadoresOperacion } from '../components/IndicadoresOperacion';
import { useGetReporte } from '../hooks/useReporte';

const cargarGrafico = () => <Skeleton className="h-[380px] w-full" />;
const GraficoOcupacion = dynamic(() => import('../components/GraficosOperacion').then((modulo) => modulo.GraficoOcupacion), { ssr: false, loading: cargarGrafico });
const GraficoEspera = dynamic(() => import('../components/GraficosOperacion').then((modulo) => modulo.GraficoEspera), { ssr: false, loading: cargarGrafico });
const GraficoRechazos = dynamic(() => import('../components/GraficosOperacion').then((modulo) => modulo.GraficoRechazos), { ssr: false, loading: cargarGrafico });

export const AlertasView = () => {
  const usuario = useAuthStore((estado) => estado.user);
  const { data: reporte, isLoading } = useGetReporte();
  const { data: notificaciones = [] } = useGetNotificaciones();
  const alertasCriticas = notificaciones.filter((notificacion) => notificacion.tipo === 'ALERTA' || notificacion.tipo === 'ERROR');

  return (
    <>
      <EncabezadoPagina
        titulo="Alertas y reportes"
        descripcion="Indicadores de la operación y el historial de alertas que requieren atención."
      />
      <IndicadoresOperacion indicadores={reporte?.indicadores} cargando={isLoading} esOperador={usuario?.rol === 'OPERADOR_PORTUARIO'} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {reporte && (
            <>
              <GraficoOcupacion datos={reporte.ocupacionPorFranja} />
              <GraficoEspera datos={reporte.historialEspera} />
              <div className="lg:col-span-2">
                <GraficoRechazos datos={reporte.rechazosPorMotivo} />
              </div>
            </>
          )}
          {isLoading && [1, 2].map((indice) => <Skeleton key={indice} className="h-[380px] w-full" />)}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Alertas recientes</CardTitle>
            <CardDescription>Retrasos, rechazos, cancelaciones y novedades en ruta.</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {alertasCriticas.length === 0 ? (
              <EstadoVacio Icono={BellOff} titulo="Todo en orden" descripcion="No hay alertas activas por ahora." />
            ) : (
              <ul className="space-y-1">
                {alertasCriticas.map((notificacion) => (
                  <ElementoNotificacion key={notificacion.id} notificacion={notificacion} rutaTurno="/dashboard/turnos" />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
