'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ETIQUETAS_ESTADO_TURNO } from '@/core/config/catalogos';
import type { EstadoTurno } from '../types/turnos.types';

const ESTADOS_FILTRO: (EstadoTurno | 'TODOS')[] = [
  'TODOS', 'PENDIENTE_VALIDACION', 'CONFIRMADO', 'EN_CAMINO', 'CON_NOVEDAD', 'RECHAZADO', 'CANCELADO', 'COMPLETADO',
];

interface FiltrosTurnosProps {
  estado: EstadoTurno | 'TODOS';
  busqueda: string;
  alCambiarEstado: (estado: EstadoTurno | 'TODOS') => void;
  alCambiarBusqueda: (busqueda: string) => void;
}

export const FiltrosTurnos = ({ estado, busqueda, alCambiarEstado, alCambiarBusqueda }: FiltrosTurnosProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <Tabs value={estado} onValueChange={(valor) => alCambiarEstado(valor as EstadoTurno | 'TODOS')} className="min-w-0">
      <div className="overflow-x-auto pb-1">
        <TabsList variant="line" aria-label="Filtrar por estado">
          {ESTADOS_FILTRO.map((estadoFiltro) => (
            <TabsTrigger key={estadoFiltro} value={estadoFiltro} className="px-2.5">
              {estadoFiltro === 'TODOS' ? 'Todos' : ETIQUETAS_ESTADO_TURNO[estadoFiltro]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
    <div className="relative lg:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={busqueda}
        onChange={(evento) => alCambiarBusqueda(evento.target.value)}
        placeholder="Buscar por código, placa o conductor"
        aria-label="Buscar turnos"
        className="h-9 pl-9"
      />
    </div>
  </div>
);
