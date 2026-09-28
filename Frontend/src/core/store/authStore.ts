import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Usuario } from '@/modules/auth/types/auth.types';

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: Usuario) => void;
  logout: () => void;
  marcarHidratado: () => void;
}

/**
 * Sin token en el store: la sesión viaja en cookie (ver CLAUDE_front, arquitectura de seguridad).
 * Reason: se persiste en sessionStorage para que cada ventana conserve su propio usuario y la
 * demostración pueda correr operador y conductor en paralelo en el mismo navegador.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      marcarHidratado: () => set({ _hasHydrated: true }),
    }),
    {
      name: 'puerto-auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (estado) => ({ user: estado.user, isAuthenticated: estado.isAuthenticated }),
      onRehydrateStorage: () => (estado) => estado?.marcarHidratado(),
    },
  ),
);
