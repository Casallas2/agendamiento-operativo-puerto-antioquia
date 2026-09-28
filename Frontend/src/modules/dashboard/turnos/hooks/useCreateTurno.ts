'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { mostrarAlertaError, mostrarAlertaInformativa } from '@/lib/alertas';
import { turnosService } from '../services/turnos.service';
import type { CrearTurnoPayload } from '../types/turnos.types';

export const useCreateTurno = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrearTurnoPayload) => turnosService.crearTurno(payload),
    onSuccess: async (turno) => {
      await queryClient.invalidateQueries({ queryKey: ['turnos'] });
      await queryClient.invalidateQueries({ queryKey: ['franjas'] });
      router.push(`/dashboard/turnos/${turno.id}`);
      void mostrarAlertaInformativa(
        `Cupo reservado · ${turno.codigo}`,
        'Tu franja quedó apartada. Ahora validamos los documentos con la <b>DIAN</b>, el <b>operador portuario</b> y el <b>RUNT</b>. Te avisaremos apenas termine; puedes seguir trabajando.',
        'success',
      );
    },
    onError: (error) => {
      void mostrarAlertaError('No pudimos reservar el turno', obtenerMensajeError(error));
      void queryClient.invalidateQueries({ queryKey: ['franjas'] });
    },
  });
};
