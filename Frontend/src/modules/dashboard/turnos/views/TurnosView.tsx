'use client';

import { CalendarPlus, ClipboardList } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { EstadoVacio } from '@/components/shared/EstadoVacio';
import { useAuthStore } from '@/core/store/authStore';
import { FiltrosTurnos } from '../components/FiltrosTurnos';
import { TablaTurnos } from '../components/TablaTurnos';
import { useCancelarTurno } from '../hooks/useCancelarTurno';
import { useGetTurnos } from '../hooks/useTurnos';
import type { EstadoTurno } from '../types/turnos.types';

export const TurnosView = () => {
  const usuario = useAuthStore((estado) => estado.user);
  const [estado, setEstado] = useState<EstadoTurno | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDeferredValue(busqueda);
  const { data: turnos = [], isLoading } = useGetTurnos({ estado, busqueda: busquedaDiferida });
  const { solicitarCancelacion } = useCancelarTurno();
  const esTransportista = usuario?.rol === 'TRANSPORTISTA';

  return (
    <>
      <EncabezadoPagina
        titulo={esTransportista ? 'Mis turnos' : 'Turnos del puerto'}
        descripcion={
          esTransportista
            ? 'Consulta el estado de tus reservas y la validación de documentos en tiempo real.'
            : 'Todos los turnos agendados por las empresas de transporte, ordenados por ventana de ingreso.'
        }
        acciones={
          esTransportista && (
            <EnlaceBoton size="lg" href="/dashboard/turnos/nuevo">
              <CalendarPlus aria-hidden />
              Reservar turno
            </EnlaceBoton>
          )
        }
      />
      <FiltrosTurnos estado={estado} busqueda={busqueda} alCambiarEstado={setEstado} alCambiarBusqueda={setBusqueda} />

      {isLoading && <Skeleton className="h-72 w-full" />}
      {!isLoading && turnos.length === 0 && (
        <EstadoVacio
          Icono={ClipboardList}
          titulo="No hay turnos con estos filtros"
          descripcion="Prueba con otro estado o limpia la búsqueda."
          accion={
            <Button variant="outline" onClick={() => { setEstado('TODOS'); setBusqueda(''); }}>
              Limpiar filtros
            </Button>
          }
        />
      )}
      {!isLoading && turnos.length > 0 && (
        <TablaTurnos turnos={turnos} puedeCancelar={esTransportista} mostrarEmpresa={!esTransportista} alCancelar={solicitarCancelacion} />
      )}
    </>
  );
};
