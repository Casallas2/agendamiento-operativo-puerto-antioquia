'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { useAuthStore } from '@/core/store/authStore';
import { mostrarAvisoEmergente } from '@/lib/alertas';
import { authService } from '../services/auth.service';
import type { CredencialesPayload, Usuario, VerificacionMfaPayload } from '../types/auth.types';

export const obtenerRutaInicio = (usuario: Usuario) => (usuario.rol === 'CONDUCTOR' ? '/conductor' : '/dashboard');

export const useIniciarSesion = () =>
  useMutation({
    mutationFn: (credenciales: CredencialesPayload) => authService.iniciarSesion(credenciales),
  });

export const useVerificarMfa = () => {
  const router = useRouter();
  const setAuth = useAuthStore((estado) => estado.setAuth);

  return useMutation({
    mutationFn: (payload: VerificacionMfaPayload) => authService.verificarCodigoMfa(payload),
    onSuccess: (usuario) => {
      setAuth(usuario);
      void mostrarAvisoEmergente(`Bienvenido, ${usuario.nombre.split(' ')[0]}`, 'Identidad verificada con doble factor.', 'EXITO');
      router.replace(obtenerRutaInicio(usuario));
    },
  });
};

export { obtenerMensajeError };
