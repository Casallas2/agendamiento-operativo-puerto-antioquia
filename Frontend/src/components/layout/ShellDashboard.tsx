'use client';

import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useUiStore } from '@/core/store/uiStore';
import { useProtegerRuta } from '@/modules/auth/hooks/useProtegerRuta';
import { useEscucharTiempoReal } from '@/modules/notificaciones/hooks/useEscucharTiempoReal';
import { BarraLateral } from './BarraLateral';
import { BarraSuperior } from './BarraSuperior';
import { PantallaCarga } from './PantallaCarga';

const OyenteTiempoReal = () => {
  useEscucharTiempoReal();
  return null;
};

export const ShellDashboard = ({ children }: { children: ReactNode }) => {
  const { usuario } = useProtegerRuta(['TRANSPORTISTA', 'OPERADOR_PORTUARIO']);
  const isSidebarOpen = useUiStore((estado) => estado.isSidebarOpen);
  const cerrarSidebar = useUiStore((estado) => estado.cerrarSidebar);

  if (!usuario) {
    return <PantallaCarga />;
  }

  return (
    <div className="flex min-h-screen flex-1">
      <OyenteTiempoReal />
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <BarraLateral usuario={usuario} />
      </aside>
      <Sheet open={isSidebarOpen} onOpenChange={(abierto) => !abierto && cerrarSidebar()}>
        <SheetContent side="left" className="w-72 border-none p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <BarraLateral usuario={usuario} alNavegar={cerrarSidebar} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <BarraSuperior usuario={usuario} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
