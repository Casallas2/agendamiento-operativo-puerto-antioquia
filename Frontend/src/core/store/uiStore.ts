import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  isSidebarOpen: boolean;
  lecturaEnVozActiva: boolean;
  avisosEmergentesActivos: boolean;
  toggleSidebar: () => void;
  cerrarSidebar: () => void;
  alternarLecturaEnVoz: () => void;
  cambiarAvisosEmergentes: (activos: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      lecturaEnVozActiva: true,
      avisosEmergentesActivos: true,
      toggleSidebar: () => set((estado) => ({ isSidebarOpen: !estado.isSidebarOpen })),
      cerrarSidebar: () => set({ isSidebarOpen: false }),
      alternarLecturaEnVoz: () => set((estado) => ({ lecturaEnVozActiva: !estado.lecturaEnVozActiva })),
      cambiarAvisosEmergentes: (activos) => set({ avisosEmergentesActivos: activos }),
    }),
    {
      name: 'puerto-ui-storage',
      partialize: (estado) => ({
        lecturaEnVozActiva: estado.lecturaEnVozActiva,
        avisosEmergentesActivos: estado.avisosEmergentesActivos,
      }),
    },
  ),
);
