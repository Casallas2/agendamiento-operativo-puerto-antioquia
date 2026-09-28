'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services/notificaciones.service';

export const useGetNotificaciones = () =>
  useQuery({
    queryKey: ['notificaciones'],
    queryFn: notificacionesService.obtenerNotificaciones,
  });

export const useMarcarNotificacionesLeidas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificacionesService.marcarTodasLeidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  });
};
