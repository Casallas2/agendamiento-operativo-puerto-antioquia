'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { confirmarAccion, mostrarAlertaError, mostrarAlertaExito } from '@/lib/alertas';
import { turnosService } from '../services/turnos.service';
import type { TurnoDetallado } from '../types/turnos.types';

export const useCancelarTurno = () => {
  const queryClient = useQueryClient();

  const mutacion = useMutation({
    mutationFn: (turnoId: string) => turnosService.cancelarTurno(turnoId),
    onSuccess: (turno) => {
      void queryClient.invalidateQueries({ queryKey: ['turnos'] });
      void mostrarAlertaExito('Turno cancelado', `El cupo del turno ${turno.codigo} quedó libre y se notificó al conductor.`);
    },
    onError: (error) => {
      void mostrarAlertaError('No se pudo cancelar', obtenerMensajeError(error));
    },
  });

  const solicitarCancelacion = async (turno: TurnoDetallado) => {
    const confirmado = await confirmarAccion({
      titulo: `¿Cancelar el turno ${turno.codigo}?`,
      texto: `Se liberará el cupo en ${turno.nombreMuelle} y ${turno.nombreConductor} recibirá un aviso. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, cancelar turno',
      esPeligrosa: true,
    });
    if (confirmado) {
      mutacion.mutate(turno.id);
    }
  };

  return { solicitarCancelacion, estaCancelando: mutacion.isPending };
};
