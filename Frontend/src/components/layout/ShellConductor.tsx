'use client';

import { LogOut, Volume2, VolumeX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AyudaEmergente } from '@/components/shared/AyudaEmergente';
import { BotonTema } from '@/components/shared/BotonTema';
import { Logo } from '@/components/shared/Logo';
import { useUiStore } from '@/core/store/uiStore';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useProtegerRuta } from '@/modules/auth/hooks/useProtegerRuta';
import { useEscucharTiempoReal } from '@/modules/notificaciones/hooks/useEscucharTiempoReal';
import { PantallaCarga } from './PantallaCarga';

const OyenteTiempoReal = () => {
  useEscucharTiempoReal();
  return null;
};

/** Layout de cabina: sin menú lateral, controles grandes y solo lo esencial para el conductor */
export const ShellConductor = ({ children }: { children: ReactNode }) => {
  const { usuario } = useProtegerRuta(['CONDUCTOR']);
  const lecturaEnVozActiva = useUiStore((estado) => estado.lecturaEnVozActiva);
  const alternarLecturaEnVoz = useUiStore((estado) => estado.alternarLecturaEnVoz);
  const { solicitarCierreSesion } = useLogout();

  if (!usuario) {
    return <PantallaCarga />;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <OyenteTiempoReal />
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4">
          <Logo compacto />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={lecturaEnVozActiva ? 'secondary' : 'ghost'}
              onClick={alternarLecturaEnVoz}
              aria-pressed={lecturaEnVozActiva}
              aria-label={lecturaEnVozActiva ? 'Desactivar lectura de avisos en voz' : 'Activar lectura de avisos en voz'}
            >
              {lecturaEnVozActiva ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
              <span className="hidden sm:inline">{lecturaEnVozActiva ? 'Voz activa' : 'Voz apagada'}</span>
            </Button>
            <BotonTema />
            <AyudaEmergente texto="Cerrar sesión">
              <Button variant="ghost" size="icon" onClick={solicitarCierreSesion} aria-label="Cerrar sesión">
                <LogOut aria-hidden />
              </Button>
            </AyudaEmergente>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="mb-5 font-heading text-2xl font-semibold tracking-tight">
          Hola, {usuario.nombre.split(' ')[0]}
        </h1>
        {children}
      </main>
    </div>
  );
};
