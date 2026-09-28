'use client';

import { format } from 'date-fns';
import { Info } from 'lucide-react';
import { useAhora } from '@/hooks/useAhora';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { useGetFranjas, useGetTurnos } from '@/modules/dashboard/turnos/hooks/useTurnos';
import { TarjetaMuelle } from '../components/TarjetaMuelle';
import { useAccionesMuelle, useGetMuelles } from '../hooks/useMuelles';

const MAXIMO_TURNOS_VISIBLES = 3;
const ESTADOS_PROXIMOS = ['CONFIRMADO', 'EN_CAMINO', 'CON_NOVEDAD', 'PENDIENTE_VALIDACION', 'EN_PUERTO'];

export const MuellesView = () => {
  const { data: muelles = [], isLoading } = useGetMuelles();
  const { data: turnos = [] } = useGetTurnos();
  const { data: franjasHoy = [] } = useGetFranjas(format(new Date(), 'yyyy-MM-dd'));
  const acciones = useAccionesMuelle();
  const ahora = useAhora();

  return (
    <>
      <EncabezadoPagina
        titulo="Estado de muelles"
        descripcion="Declara retrasos o mantenimientos: los conductores y transportistas afectados reciben el aviso de inmediato."
      />
      <Alert role="note" className="border-info/30 bg-info/5">
        <Info className="text-info" aria-hidden />
        <AlertTitle>Prueba el tiempo real</AlertTitle>
        <AlertDescription>
          Abre otra ventana con la cuenta de <strong>conductor</strong> y declara un retraso en el Muelle 2. El aviso le llega al instante y se lee
          en voz alta.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((indice) => (
            <Skeleton key={indice} className="h-80" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {muelles.map((muelle) => {
            const franjasMuelle = franjasHoy.filter((franja) => franja.muelleId === muelle.id);
            const turnosProximos = turnos
              .filter(
                (turno) =>
                  turno.muelleId === muelle.id &&
                  ESTADOS_PROXIMOS.includes(turno.estado) &&
                  new Date(turno.fin).getTime() + turno.retrasoMinutos * 60000 >= ahora,
              )
              .slice(0, MAXIMO_TURNOS_VISIBLES);
            return (
              <TarjetaMuelle
                key={muelle.id}
                muelle={muelle}
                turnosProximos={turnosProximos}
                ocupacionHoy={{
                  ocupados: franjasMuelle.reduce((total, franja) => total + franja.ocupados, 0),
                  capacidad: franjasMuelle.reduce((total, franja) => total + franja.capacidad, 0),
                }}
                estaProcesando={acciones.estaProcesando}
                alDeclararRetraso={acciones.declararRetraso}
                alRestablecer={acciones.restablecerOperacion}
                alAlternarMantenimiento={acciones.alternarMantenimiento}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
