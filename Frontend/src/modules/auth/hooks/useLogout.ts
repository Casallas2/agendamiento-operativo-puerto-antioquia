'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/core/store/authStore';
import { confirmarAccion } from '@/lib/alertas';
import { authService } from '../services/auth.service';

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((estado) => estado.logout);

  const mutacion = useMutation({
    mutationFn: authService.cerrarSesion,
    onSettled: () => {
      logout();
      queryClient.clear();
      router.replace('/login');
    },
  });

  const solicitarCierreSesion = async () => {
    const confirmado = await confirmarAccion({
      titulo: '¿Cerrar sesión?',
      texto: 'Dejarás de recibir avisos en tiempo real en este dispositivo.',
      textoConfirmar: 'Sí, cerrar sesión',
    });
    if (confirmado) {
      mutacion.mutate();
    }
  };

  return { solicitarCierreSesion, estaCerrando: mutacion.isPending };
};
