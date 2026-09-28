'use client';

import { Menu, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AyudaEmergente } from '@/components/shared/AyudaEmergente';
import { BotonTema } from '@/components/shared/BotonTema';
import { Logo } from '@/components/shared/Logo';
import { useUiStore } from '@/core/store/uiStore';
import type { Usuario } from '@/modules/auth/types/auth.types';
import { PanelNotificaciones } from '@/modules/notificaciones/components/PanelNotificaciones';
import { MenuUsuario } from './MenuUsuario';

export const BarraSuperior = ({ usuario }: { usuario: Usuario }) => {
  const toggleSidebar = useUiStore((estado) => estado.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card px-4 lg:px-8">
      <AyudaEmergente texto="Abrir menú">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar} aria-label="Abrir menú">
          <Menu aria-hidden />
        </Button>
      </AyudaEmergente>
      <Logo className="lg:hidden" compacto />

      {/* Indicador de conexión: un punto y una palabra, sin insignia de color */}
      <p className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <Radio className="size-3.5 animate-pulse text-success" aria-hidden />
        Tiempo real
      </p>

      <div className="ml-auto flex items-center gap-1">
        <BotonTema />
        <PanelNotificaciones />
        <MenuUsuario usuario={usuario} />
      </div>
    </header>
  );
};
