'use client';

import { AlertOctagon, Bell, FileText, Navigation, Volume2 } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ETIQUETAS_ESTADO_TURNO } from '@/core/config/catalogos';
import { formatearDiaRelativo, formatearHora } from '@/lib/formatos';
import { leerTextoEnVoz } from '@/lib/voz';
import { evaluarDocumentosConductor, evaluarDocumentosVehiculo } from '@/modules/dashboard/flota/services/flota.service';
import { useGetNotificaciones } from '@/modules/notificaciones/hooks/useNotificaciones';
import { BotonAccionCabina } from '../components/BotonAccionCabina';
import { BotonMicrofono } from '../components/BotonMicrofono';
import { ListaAvisosCabina } from '../components/ListaAvisosCabina';
import { SeccionDocumentosCabina } from '../components/SeccionDocumentosCabina';
import { describirTiempoRestante, TarjetaTurnoActual } from '../components/TarjetaTurnoActual';
import { useAccionesConductor } from '../hooks/useAccionesConductor';
import { useComandosVoz } from '../hooks/useComandosVoz';
import { useGetResumenConductor } from '../hooks/useResumenConductor';
import type { EstadoTurno } from '@/modules/dashboard/turnos/types/turnos.types';
import type { ComandoVoz } from '../types/conductor.types';

const MAXIMO_AVISOS = 4;

/** Desde estos estados el conductor puede declarar que va en camino */
const ESTADOS_QUE_PERMITEN_VIAJAR: EstadoTurno[] = ['CONFIRMADO', 'CON_NOVEDAD'];

/** Texto bajo el botón de viaje: explica por qué está activo o bloqueado */
const DESCRIPCION_VIAJE: Record<EstadoTurno, string> = {
  PENDIENTE_VALIDACION: 'Espera a que validen tus documentos',
  CONFIRMADO: 'Avisar al puerto que salí',
  CON_NOVEDAD: 'Avisar que la novedad se resolvió',
  EN_CAMINO: 'Ya avisaste que vas en camino',
  EN_PUERTO: 'Ya llegaste al puerto',
  RECHAZADO: 'Este turno fue rechazado',
  COMPLETADO: 'Este turno ya terminó',
  CANCELADO: 'Este turno fue cancelado',
};

export const ConductorView = () => {
  const { data: resumen, isLoading } = useGetResumenConductor();
  const { data: notificaciones = [] } = useGetNotificaciones();
  const { iniciarViaje, reportarNovedad, estaProcesando } = useAccionesConductor();
  const seccionDocumentosRef = useRef<HTMLElement>(null);
  const seccionAvisosRef = useRef<HTMLElement>(null);

  const turno = resumen?.turnoActual ?? null;
  const documentos = useMemo(
    () => [
      ...(resumen?.conductor ? evaluarDocumentosConductor(resumen.conductor) : []),
      ...(resumen?.vehiculo ? evaluarDocumentosVehiculo(resumen.vehiculo) : []),
    ],
    [resumen],
  );
  const avisos = useMemo(() => notificaciones.slice(0, MAXIMO_AVISOS), [notificaciones]);

  const puedeIniciarViaje = Boolean(turno && ESTADOS_QUE_PERMITEN_VIAJAR.includes(turno.estado));
  const retomaTrasNovedad = turno?.estado === 'CON_NOVEDAD';

  const leerTurno = useCallback(() => {
    if (!turno) {
      leerTextoEnVoz('No tienes turnos activos por ahora.');
      return;
    }
    const retraso = turno.retrasoMinutos > 0 ? ` Atención: el muelle tiene un retraso de ${turno.retrasoMinutos} minutos.` : '';
    leerTextoEnVoz(
      `Tu turno ${turno.codigo} es ${formatearDiaRelativo(turno.inicio)} a las ${formatearHora(turno.inicio, turno.retrasoMinutos)}, en el ${turno.nombreMuelle}. ` +
        `Estado: ${ETIQUETAS_ESTADO_TURNO[turno.estado]}. ${describirTiempoRestante(turno)}.${retraso}`,
    );
  }, [turno]);

  const leerDocumentos = useCallback(() => {
    seccionDocumentosRef.current?.scrollIntoView({ behavior: 'smooth' });
    const problemas = documentos.filter((documento) => documento.semaforo !== 'VIGENTE');
    leerTextoEnVoz(
      problemas.length === 0
        ? 'Todos tus documentos están vigentes.'
        : problemas.map((documento) => `${documento.nombre}: ${documento.semaforo === 'VENCIDO' ? 'vencido' : `vence en ${documento.diasRestantes} días`}`).join('. '),
    );
  }, [documentos]);

  const leerAvisos = useCallback(() => {
    seccionAvisosRef.current?.scrollIntoView({ behavior: 'smooth' });
    leerTextoEnVoz(avisos.length === 0 ? 'No tienes avisos nuevos.' : `Último aviso: ${avisos[0].titulo}. ${avisos[0].mensaje}`);
  }, [avisos]);

  const ejecutarComando = useCallback(
    (comando: ComandoVoz) => {
      const acciones: Record<ComandoVoz, () => void> = {
        TURNO: leerTurno,
        DOCUMENTOS: leerDocumentos,
        AVISOS: leerAvisos,
        EN_CAMINO: () => (turno ? void iniciarViaje(turno) : leerTextoEnVoz('No tienes un turno para iniciar viaje.')),
        NOVEDAD: () => (turno ? void reportarNovedad(turno) : leerTextoEnVoz('No tienes un turno activo.')),
        AYUDA: () => leerTextoEnVoz('Puedes decir: mi turno, documentos, avisos, voy en camino o novedad.'),
      };
      acciones[comando]();
    },
    [leerTurno, leerDocumentos, leerAvisos, turno, iniciarViaje, reportarNovedad],
  );

  const voz = useComandosVoz(ejecutarComando);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TarjetaTurnoActual turno={turno} />

      <section aria-label="Acciones rápidas" className="grid gap-4 sm:grid-cols-2">
        <BotonAccionCabina
          etiqueta={retomaTrasNovedad ? 'Ya seguimos' : 'Voy en camino'}
          descripcion={DESCRIPCION_VIAJE[turno?.estado ?? 'PENDIENTE_VALIDACION']}
          Icono={Navigation}
          tono="primario"
          deshabilitado={!turno || !puedeIniciarViaje || estaProcesando}
          alPresionar={() => turno && iniciarViaje(turno)}
        />
        <BotonAccionCabina
          etiqueta="Reportar novedad"
          descripcion={
            turno?.estado === 'CON_NOVEDAD' ? 'Ya reportaste una novedad' : 'Trancón, falla o retraso'
          }
          Icono={AlertOctagon}
          tono="alerta"
          deshabilitado={!turno || turno.estado === 'CON_NOVEDAD' || estaProcesando}
          alPresionar={() => turno && reportarNovedad(turno)}
        />
        <BotonAccionCabina etiqueta="Escuchar mi turno" descripcion="Lo leemos en voz alta" Icono={Volume2} alPresionar={leerTurno} />
        <BotonAccionCabina etiqueta="Mis documentos" descripcion="SOAT, licencia y técnico-mecánica" Icono={FileText} alPresionar={leerDocumentos} />
      </section>

      <BotonMicrofono
        estaEscuchando={voz.estaEscuchando}
        esCompatible={voz.esCompatible}
        ultimaTranscripcion={voz.ultimaTranscripcion}
        mensajeEstado={voz.mensajeEstado}
        alIniciar={voz.iniciarEscucha}
        alDetener={voz.detenerEscucha}
      />

      <ListaAvisosCabina ref={seccionAvisosRef} avisos={avisos} />
      <SeccionDocumentosCabina ref={seccionDocumentosRef} documentos={documentos} />

      <Button type="button" variant="outline" onClick={leerAvisos} className="h-auto w-full gap-2 rounded-xl py-4 text-base">
        <Bell className="size-5" aria-hidden />
        Escuchar el último aviso
      </Button>
    </div>
  );
};
