'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RUTAS_POR_ROL } from '@/core/config/navegacion';
import { useAuthStore } from '@/core/store/authStore';
import type { RolUsuario } from '../types/auth.types';
import { obtenerRutaInicio } from './useLogin';
import { useMe } from './useMe';

/**
 * Flujo de protección en orden: hidratación → autenticación → perfil del servidor → rol.
 * Devuelve el usuario solo cuando es seguro renderizar el contenido protegido.
 */
export const useProtegerRuta = (rolesPermitidos: RolUsuario[]) => {
  const router = useRouter();
  const rutaActual = usePathname();
  const haHidratado = useAuthStore((estado) => estado._hasHydrated);
  const isAuthenticated = useAuthStore((estado) => estado.isAuthenticated);
  const logout = useAuthStore((estado) => estado.logout);
  const { data: usuario, isLoading, isError } = useMe();

  const rolesRuta = Object.entries(RUTAS_POR_ROL).find(([ruta]) => rutaActual.startsWith(ruta))?.[1];
  const tieneRolPermitido = Boolean(
    usuario && rolesPermitidos.includes(usuario.rol) && (!rolesRuta || rolesRuta.includes(usuario.rol)),
  );

  useEffect(() => {
    if (!haHidratado) {
      return;
    }
    if (!isAuthenticated || isError) {
      logout();
      router.replace('/login');
      return;
    }
    if (usuario && !tieneRolPermitido) {
      router.replace(obtenerRutaInicio(usuario));
    }
  }, [haHidratado, isAuthenticated, isError, usuario, tieneRolPermitido, logout, router]);

  const estaListo = haHidratado && isAuthenticated && !isLoading && tieneRolPermitido;
  return { usuario: estaListo ? usuario : undefined, estaListo };
};
