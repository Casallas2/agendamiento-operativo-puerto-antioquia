'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/api';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { confirmarAccion, mostrarAlertaError, mostrarAlertaExito } from '@/lib/alertas';

/**
 * Restaura los datos de ejemplo antes de una sustentación (POST /api/v1/demo/reset).
 * La sesión sobrevive al reinicio porque la semilla usa identificadores fijos.
 */
export const useReiniciarDemostracion = () => {
  const queryClient = useQueryClient();

  const mutacion = useMutation({
    mutationFn: () => api.post('/demo/reset'),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      await mostrarAlertaExito('Datos restaurados', 'La demostración quedó como nueva.');
    },
    onError: (error) => {
      void mostrarAlertaError('No se pudo reiniciar', obtenerMensajeError(error));
    },
  });

  const reiniciarDemostracion = async () => {
    const confirmado = await confirmarAccion({
      titulo: '¿Reiniciar la demostración?',
      texto: 'Se borran los turnos creados y las notificaciones, y se restauran los datos de ejemplo.',
      textoConfirmar: 'Reiniciar datos',
      esPeligrosa: true,
    });
    if (confirmado) {
      mutacion.mutate();
    }
  };

  return { reiniciarDemostracion, estaReiniciando: mutacion.isPending };
};
