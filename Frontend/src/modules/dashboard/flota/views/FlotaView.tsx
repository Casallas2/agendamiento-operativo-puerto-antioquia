'use client';

import { IdCard, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { InsigniaSemaforo } from '@/components/shared/InsigniaEstado';
import { formatearFechaCorta } from '@/lib/formatos';
import { useGetConductores, useGetVehiculos } from '../hooks/useFlota';
import { evaluarDocumentosConductor, evaluarDocumentosVehiculo } from '../services/flota.service';
import type { EstadoDocumento } from '../types/flota.types';

const describirDocumento = (documento: EstadoDocumento) => {
  if (documento.semaforo === 'VENCIDO') {
    return `${documento.nombre}: vencido`;
  }
  if (documento.semaforo === 'POR_VENCER') {
    return `${documento.nombre}: ${documento.diasRestantes} días`;
  }
  return `${documento.nombre}: vigente`;
};

const ListaDocumentos = ({ documentos }: { documentos: EstadoDocumento[] }) => (
  <div className="flex flex-wrap gap-2">
    {documentos.map((documento) => (
      <Tooltip key={documento.nombre}>
        <TooltipTrigger render={<span tabIndex={0} className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />}>
          <InsigniaSemaforo semaforo={documento.semaforo} texto={describirDocumento(documento)} />
        </TooltipTrigger>
        <TooltipContent>Vence el {formatearFechaCorta(documento.vencimiento)}</TooltipContent>
      </Tooltip>
    ))}
  </div>
);

export const FlotaView = () => {
  const { data: vehiculos = [], isLoading: cargandoVehiculos } = useGetVehiculos();
  const { data: conductores = [], isLoading: cargandoConductores } = useGetConductores();

  return (
    <>
      <EncabezadoPagina
        titulo="Flota y documentos"
        descripcion="Semáforo de vencimientos. Los documentos vencidos bloquean la reserva de turnos para evitar rechazos en la validación."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-5 text-primary" aria-hidden />
              Vehículos
            </CardTitle>
            <CardDescription>SOAT, revisión técnico-mecánica y estado RUNT.</CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoVehiculos ? (
              <Skeleton className="h-48" />
            ) : (
              <ul className="divide-y">
                {vehiculos.map((vehiculo) => (
                  <li key={vehiculo.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-mono text-base font-semibold">{vehiculo.placa}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehiculo.marca} · {vehiculo.tipo}
                      </p>
                    </div>
                    <ListaDocumentos documentos={evaluarDocumentosVehiculo(vehiculo)} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="size-5 text-primary" aria-hidden />
              Conductores
            </CardTitle>
            <CardDescription>Licencia de conducción consultada en el RUNT.</CardDescription>
          </CardHeader>
          <CardContent>
            {cargandoConductores ? (
              <Skeleton className="h-48" />
            ) : (
              <ul className="divide-y">
                {conductores.map((conductor) => (
                  <li key={conductor.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{conductor.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        C.C. {conductor.cedula} · Categoría {conductor.categoriaLicencia}
                      </p>
                    </div>
                    <ListaDocumentos documentos={evaluarDocumentosConductor(conductor)} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
