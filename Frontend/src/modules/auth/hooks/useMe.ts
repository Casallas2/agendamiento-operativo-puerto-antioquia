'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/core/store/authStore';
import { authService } from '../services/auth.service';

/** El rol siempre se confirma contra el "servidor", nunca se confía en localStorage */
export const useMe = () => {
  const isAuthenticated = useAuthStore((estado) => estado.isAuthenticated);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.obtenerPerfil,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 0,
  });
};
