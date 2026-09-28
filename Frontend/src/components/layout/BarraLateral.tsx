'use client';

import { BookOpen, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AyudaEmergente } from '@/components/shared/AyudaEmergente';
import { Logo } from '@/components/shared/Logo';
import { ETIQUETAS_ROL } from '@/core/config/catalogos';
import { ELEMENTOS_NAVEGACION, esRutaActiva } from '@/core/config/navegacion';
import { obtenerIniciales } from '@/lib/formatos';
import { cn } from '@/lib/utils';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import type { Usuario } from '@/modules/auth/types/auth.types';

interface BarraLateralProps {
  usuario: Usuario;
  alNavegar?: () => void;
}

export const BarraLateral = ({ usuario, alNavegar }: BarraLateralProps) => {
  const rutaActual = usePathname();
  const { solicitarCierreSesion, estaCerrando } = useLogout();
  const elementosVisibles = ELEMENTOS_NAVEGACION.filter((elemento) => elemento.roles.includes(usuario.rol));

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Operación
        </p>
        {elementosVisibles.map((elemento) => {
          const estaActivo = esRutaActiva(rutaActual, elemento);
          return (
            <Link
              key={elemento.ruta}
              href={elemento.ruta}
              onClick={alNavegar}
              aria-current={estaActivo ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                // El activo se distingue por fondo y peso, no solo por color
                estaActivo
                  ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <elemento.Icono
                className={cn('size-[18px] shrink-0', estaActivo ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden
              />
              {elemento.etiqueta}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/proyecto"
          onClick={alNavegar}
          className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <BookOpen className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
          Backlog y diseño UX
        </Link>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-[11px] font-medium text-primary">
              {obtenerIniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{usuario.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ETIQUETAS_ROL[usuario.rol]}
            </p>
          </div>
          <AyudaEmergente texto="Cerrar sesión" lado="top">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              disabled={estaCerrando}
              onClick={solicitarCierreSesion}
              aria-label="Cerrar sesión"
            >
              <LogOut aria-hidden />
            </Button>
          </AyudaEmergente>
        </div>
      </div>
    </div>
  );
};
