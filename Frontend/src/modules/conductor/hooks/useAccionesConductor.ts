'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { confirmarAccion, mostrarAlertaError, mostrarAlertaExito, solicitarSeleccion, type OpcionAlerta } from '@/lib/alertas';
import { leerTextoEnVoz } from '@/lib/voz';
import type { TurnoDetallado } from '@/modules/dashboard/turnos/types/turnos.types';
import { conductorService } from '../services/conductor.service';

const NOVEDADES_FRECUENTES: OpcionAlerta[] = [
  { valor: 'Trancón en la vía', etiqueta: 'Trancón en la vía', descripcion: 'Tráfico detenido o cierre parcial' },
  { valor: 'Falla mecánica', etiqueta: 'Falla mecánica', descripcion: 'El vehículo no puede continuar' },
  { valor: 'Llegaré tarde a mi ventana', etiqueta: 'Llegaré tarde', descripcion: 'No alcanzo a entrar en mi franja' },
  { valor: 'Retén o control policial', etiqueta: 'Retén o control', descripcion: 'Control policial o de tránsito' },
];

export const useAccionesConductor = () => {
  const queryClient = useQueryClient();
  const refrescarResumen = () => queryClient.invalidateQueries({ queryKey: ['conductor'] });
  const manejarError = (error: unknown) => {
    const mensaje = obtenerMensajeError(error);
    leerTextoEnVoz(mensaje);
    void mostrarAlertaError('No se pudo completar', mensaje);
  };

  const mutacionEnCamino = useMutation({
    mutationFn: conductorService.marcarEnCamino,
    onSuccess: (turno) => {
      void refrescarResumen();
      leerTextoEnVoz(`Listo. Avisamos al puerto que vas en camino al ${turno.nombreMuelle}. Buen viaje.`);
      void mostrarAlertaExito('¡Buen viaje!', `Avisamos al puerto que vas en camino al ${turno.nombreMuelle}.`);
    },
    onError: manejarError,
  });

  const mutacionNovedad = useMutation({
    mutationFn: ({ turnoId, novedad }: { turnoId: string; novedad: string }) => conductorService.reportarNovedad(turnoId, novedad),
    onSuccess: () => {
      leerTextoEnVoz('Novedad enviada. Tu transportista y el puerto ya fueron avisados.');
      void mostrarAlertaExito('Novedad enviada', 'Tu transportista y el puerto ya fueron avisados.');
    },
    onError: manejarError,
  });

  const iniciarViaje = async (turno: TurnoDetallado) => {
    const confirmado = await confirmarAccion({
      titulo: '¿Sales ya hacia el puerto?',
      texto: `Se avisará que vas en camino al ${turno.nombreMuelle} para el turno ${turno.codigo}.`,
      textoConfirmar: 'Sí, voy en camino',
    });
    if (confirmado) {
      mutacionEnCamino.mutate(turno.id);
    }
  };

  const reportarNovedad = async (turno: TurnoDetallado) => {
    const novedad = await solicitarSeleccion({
      titulo: 'Reportar novedad',
      texto: 'Elige lo que está pasando. No necesitas escribir.',
      opciones: NOVEDADES_FRECUENTES,
      textoConfirmar: 'Enviar novedad',
    });
    if (novedad) {
      mutacionNovedad.mutate({ turnoId: turno.id, novedad });
    }
  };

  return {
    iniciarViaje,
    reportarNovedad,
    estaProcesando: mutacionEnCamino.isPending || mutacionNovedad.isPending,
  };
};
