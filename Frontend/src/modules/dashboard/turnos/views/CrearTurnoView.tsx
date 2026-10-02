'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState, type ReactNode } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EncabezadoPagina } from '@/components/shared/EncabezadoPagina';
import { mostrarAlertaError } from '@/lib/alertas';
import { crearTurnoSchema, type CrearTurnoFormulario } from '@/lib/validators';
import { useGetConductores, useGetVehiculos } from '@/modules/dashboard/flota/hooks/useFlota';
import { useGetMuelles } from '@/modules/dashboard/muelles/hooks/useMuelles';
import { ResumenReserva } from '../components/ResumenReserva';
import { SeccionDocumentosCarga } from '../components/SeccionDocumentosCarga';
import { SeccionVehiculoConductor } from '../components/SeccionVehiculoConductor';
import { SelectorFranja } from '../components/SelectorFranja';
import { useCreateTurno } from '../hooks/useCreateTurno';
import type { Franja } from '../types/turnos.types';

interface SeccionNumeradaProps {
  numero: number;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}

const SeccionNumerada = ({ numero, titulo, descripcion, children }: SeccionNumeradaProps) => (
  <Card>
    <CardHeader className="flex flex-row items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {numero}
      </span>
      <div className="space-y-1">
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const CrearTurnoView = () => {
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<Franja>();
  const { data: vehiculos, isLoading: cargandoVehiculos } = useGetVehiculos();
  const { data: conductores, isLoading: cargandoConductores } = useGetConductores();
  const { data: muelles = [] } = useGetMuelles();
  const { mutate: crearTurno, isPending } = useCreateTurno();

  const formulario = useForm<CrearTurnoFormulario>({
    resolver: zodResolver(crearTurnoSchema),
    defaultValues: {
      vehiculoId: '',
      conductorId: '',
      tipoOperacion: 'EXPORTACION',
      tipoCarga: 'Banano refrigerado',
      numeroManifiesto: '',
      numeroBl: '',
      cargaRefrigerada: true,
      numeroCertificadoIca: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      franjaId: '',
      observaciones: '',
      aceptaDeclaracion: false,
    },
  });
  const { control, setValue, handleSubmit, formState } = formulario;
  const [fecha, vehiculoId, conductorId, tipoCarga, franjaId, cargaRefrigerada] = useWatch({
    control,
    name: ['fecha', 'vehiculoId', 'conductorId', 'tipoCarga', 'franjaId', 'cargaRefrigerada'],
  });

  const cambiarFecha = (nuevaFecha: string) => {
    setValue('fecha', nuevaFecha);
    setValue('franjaId', '');
    setFranjaSeleccionada(undefined);
  };

  const seleccionarFranja = (franja: Franja) => {
    setValue('franjaId', franja.id, { shouldValidate: true });
    setFranjaSeleccionada(franja);
  };

  const enviarFormulario = handleSubmit(
    (datos) =>
      crearTurno({
        vehiculoId: datos.vehiculoId,
        conductorId: datos.conductorId,
        tipoOperacion: datos.tipoOperacion,
        tipoCarga: datos.tipoCarga,
        numeroManifiesto: datos.numeroManifiesto,
        numeroBl: datos.numeroBl,
        cargaRefrigerada: datos.cargaRefrigerada,
        numeroCertificadoIca: datos.cargaRefrigerada ? datos.numeroCertificadoIca : undefined,
        franjaId: datos.franjaId,
        observaciones: datos.observaciones,
      }),
    () => void mostrarAlertaError('Faltan datos por completar', 'Revisa los campos marcados en rojo antes de reservar.'),
  );

  if (cargandoVehiculos || cargandoConductores) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  return (
    <FormProvider {...formulario}>
      <EncabezadoPagina
        titulo="Reservar turno de ingreso"
        descripcion="Completa los tres pasos. Solo verás las franjas con cupo disponible y los vehículos habilitados."
      />
      <form onSubmit={enviarFormulario} noValidate className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SeccionNumerada numero={1} titulo="Vehículo, conductor y carga" descripcion="Quién llega y qué transporta.">
            <SeccionVehiculoConductor vehiculos={vehiculos ?? []} conductores={conductores ?? []} />
          </SeccionNumerada>
          <SeccionNumerada numero={2} titulo="Documentos de la carga" descripcion="Se verifican con la DIAN, el operador portuario y, si la carga es refrigerada, el ICA.">
            <SeccionDocumentosCarga />
          </SeccionNumerada>
          <SeccionNumerada numero={3} titulo="Día y franja horaria" descripcion="Franjas de 2 horas. Las llenas o pasadas aparecen tachadas.">
            <SelectorFranja
              fecha={fecha}
              franjaId={franjaId}
              tipoCarga={tipoCarga}
              cargaRefrigerada={cargaRefrigerada}
              alCambiarFecha={cambiarFecha}
              alSeleccionarFranja={seleccionarFranja}
            />
            {formState.errors.franjaId && (
              <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                {formState.errors.franjaId.message}
              </p>
            )}
          </SeccionNumerada>
        </div>
        <ResumenReserva
          placa={vehiculos?.find((vehiculo) => vehiculo.id === vehiculoId)?.placa}
          nombreConductor={conductores?.find((conductor) => conductor.id === conductorId)?.nombre}
          tipoCarga={tipoCarga}
          cargaRefrigerada={cargaRefrigerada}
          franja={franjaSeleccionada}
          nombreMuelle={muelles.find((muelle) => muelle.id === franjaSeleccionada?.muelleId)?.nombre}
          estaEnviando={isPending}
        />
      </form>
    </FormProvider>
  );
};
