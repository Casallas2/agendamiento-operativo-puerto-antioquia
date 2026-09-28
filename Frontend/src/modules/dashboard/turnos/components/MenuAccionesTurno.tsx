'use client';

import { Copy, Ellipsis, Eye, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mostrarAvisoEmergente } from '@/lib/alertas';
import type { TurnoDetallado } from '../types/turnos.types';

interface MenuAccionesTurnoProps {
  turno: TurnoDetallado;
  puedeCancelar: boolean;
  alCancelar: (turno: TurnoDetallado) => void;
}

export const esTurnoCancelable = (turno: TurnoDetallado) => turno.estado === 'PENDIENTE_VALIDACION' || turno.estado === 'CONFIRMADO';

/** Acciones secundarias agrupadas: la tabla queda limpia y la acción destructiva se separa visualmente */
export const MenuAccionesTurno = ({ turno, puedeCancelar, alCancelar }: MenuAccionesTurnoProps) => {
  const router = useRouter();

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(turno.codigo);
      void mostrarAvisoEmergente('Código copiado', `${turno.codigo} quedó en el portapapeles.`, 'EXITO');
    } catch {
      void mostrarAvisoEmergente('No se pudo copiar', 'Tu navegador bloqueó el acceso al portapapeles.', 'ERROR');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Más acciones del turno ${turno.codigo}`} />}>
        <Ellipsis aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-mono">{turno.codigo}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/turnos/${turno.id}`)}>
            <Eye aria-hidden />
            Ver detalle y validación
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copiarCodigo}>
            <Copy aria-hidden />
            Copiar código
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {puedeCancelar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={!esTurnoCancelable(turno)} onClick={() => alCancelar(turno)}>
              <XCircle aria-hidden />
              Cancelar turno
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
