'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useValorCliente } from '@/hooks/useEstaEnCliente';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AyudaEmergente } from './AyudaEmergente';

interface BotonTemaProps {
  className?: string;
  conTexto?: boolean;
}

export const BotonTema = ({ className, conTexto = false }: BotonTemaProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const estaMontado = useValorCliente(() => true, false);

  const esOscuro = estaMontado && resolvedTheme === 'dark';
  const etiqueta = esOscuro ? 'Modo día' : 'Modo noche';

  const boton = (
    <Button
      variant="ghost"
      size={conTexto ? 'lg' : 'icon'}
      className={cn(className)}
      onClick={() => setTheme(esOscuro ? 'light' : 'dark')}
      aria-label={etiqueta}
    >
      {esOscuro ? <Sun aria-hidden /> : <Moon aria-hidden />}
      {conTexto && <span>{etiqueta}</span>}
    </Button>
  );

  return conTexto ? boton : <AyudaEmergente texto={etiqueta}>{boton}</AyudaEmergente>;
};
