import { CalendarCheck, Clock, FileX2, Ship, Truck } from 'lucide-react';
import { TarjetaIndicador } from '@/components/shared/TarjetaIndicador';
import type { IndicadoresOperacion as Indicadores } from '../types/alertas.types';

interface IndicadoresOperacionProps {
  indicadores?: Indicadores;
  cargando: boolean;
  esOperador: boolean;
}

export const IndicadoresOperacion = ({ indicadores, cargando, esOperador }: IndicadoresOperacionProps) => (
  <div className="animar-lista grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <TarjetaIndicador
      titulo="Turnos de hoy"
      valor={indicadores?.turnosHoy ?? 0}
      detalle={`${indicadores?.turnosConfirmadosHoy ?? 0} confirmados · ${indicadores?.turnosEnValidacion ?? 0} en validación`}
      Icono={CalendarCheck}
      cargando={cargando}
    />
    <TarjetaIndicador
      titulo="Vehículos en camino"
      valor={indicadores?.vehiculosEnCamino ?? 0}
      detalle="Reportados desde la app de cabina"
      Icono={Truck}
      cargando={cargando}
    />
    {esOperador ? (
      <TarjetaIndicador
        titulo="Muelles con novedad"
        valor={indicadores?.muellesConNovedad ?? 0}
        detalle="Retraso o mantenimiento activo"
        Icono={Ship}
        cargando={cargando}
        destacado={indicadores?.muellesConNovedad ? 'alerta' : undefined}
        tonoDetalle={indicadores?.muellesConNovedad ? 'negativo' : 'neutro'}
      />
    ) : (
      <TarjetaIndicador
        titulo="Tasa de rechazo documental"
        valor={`${indicadores?.tasaRechazoDocumental ?? 0}%`}
        detalle="Turnos rechazados en validación"
        Icono={FileX2}
        cargando={cargando}
        destacado={(indicadores?.tasaRechazoDocumental ?? 0) > 20 ? 'alerta' : undefined}
        tonoDetalle={(indicadores?.tasaRechazoDocumental ?? 0) > 20 ? 'negativo' : 'neutro'}
      />
    )}
    <TarjetaIndicador
      titulo="Espera promedio en vía"
      valor={`${indicadores?.esperaPromedioMinutos ?? 0} min`}
      detalle={`↓ ${indicadores?.reduccionEsperaPorcentaje ?? 0}% frente a hace 10 días`}
      Icono={Clock}
      cargando={cargando}
      destacado="exito"
      tonoDetalle="positivo"
    />
  </div>
);
