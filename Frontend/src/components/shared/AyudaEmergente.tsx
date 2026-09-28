'use client';

import type { ReactElement } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AyudaEmergenteProps {
  texto: string;
  lado?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactElement;
}

/** Tooltip para botones de solo icono: el usuario reconoce la acción sin tener que adivinarla */
export const AyudaEmergente = ({ texto, lado = 'bottom', children }: AyudaEmergenteProps) => (
  <Tooltip>
    <TooltipTrigger render={children} />
    <TooltipContent side={lado}>{texto}</TooltipContent>
  </Tooltip>
);
