'use client';

import { BookOpen, ChevronDown, LogOut, Moon, RotateCcw, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useReiniciarDemostracion } from '@/modules/auth/hooks/useReiniciarDemostracion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ETIQUETAS_ROL } from '@/core/config/catalogos';
import { useUiStore } from '@/core/store/uiStore';
import { obtenerIniciales } from '@/lib/formatos';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import type { Usuario } from '@/modules/auth/types/auth.types';

export const MenuUsuario = ({ usuario }: { usuario: Usuario }) => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { solicitarCierreSesion, estaCerrando } = useLogout();
  const { reiniciarDemostracion, estaReiniciando } = useReiniciarDemostracion();
  const avisosEmergentesActivos = useUiStore((estado) => estado.avisosEmergentesActivos);
  const cambiarAvisosEmergentes = useUiStore((estado) => estado.cambiarAvisosEmergentes);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label={`Menú de ${usuario.nombre}`} />}>
        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">{obtenerIniciales(usuario.nombre)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm md:inline">{usuario.nombre.split(' ')[0]}</span>
        <ChevronDown className="text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-medium text-foreground">{usuario.nombre}</span>
            <span className="font-normal">
              {ETIQUETAS_ROL[usuario.rol]} · {usuario.empresaNombre}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={resolvedTheme ?? 'light'} onValueChange={(tema) => setTheme(String(tema))}>
            <DropdownMenuRadioItem value="light">
              <Sun aria-hidden />
              Modo día
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon aria-hidden />
              Modo noche
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuCheckboxItem checked={avisosEmergentesActivos} onCheckedChange={cambiarAvisosEmergentes}>
            Avisos emergentes
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/proyecto')}>
            <BookOpen aria-hidden />
            Backlog Scrum y diseño UX
          </DropdownMenuItem>
          {/* Vive aquí y no en la portada porque POST /demo/reset exige sesión iniciada */}
          <DropdownMenuItem disabled={estaReiniciando} onClick={reiniciarDemostracion}>
            <RotateCcw aria-hidden />
            {estaReiniciando ? 'Restaurando…' : 'Reiniciar datos de demostración'}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={estaCerrando} onClick={solicitarCierreSesion}>
            <LogOut aria-hidden />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
