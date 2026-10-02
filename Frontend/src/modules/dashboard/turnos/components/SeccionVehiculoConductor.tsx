'use client';

import { AlertTriangle, PackageOpen, Ship } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CampoFormulario } from '@/components/shared/CampoFormulario';
import { SelectorOpciones } from '@/components/shared/SelectorOpciones';
import { ETIQUETAS_OPERACION, TIPOS_CARGA, TIPOS_CARGA_REFRIGERADA } from '@/core/config/catalogos';
import type { CrearTurnoFormulario } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { evaluarDocumentosConductor, evaluarDocumentosVehiculo } from '@/modules/dashboard/flota/services/flota.service';
import type { Conductor, Vehiculo } from '@/modules/dashboard/flota/types/flota.types';
import type { TipoOperacion } from '../types/turnos.types';

interface SeccionVehiculoConductorProps {
  vehiculos: Vehiculo[];
  conductores: Conductor[];
}

const ICONO_OPERACION: Record<TipoOperacion, typeof Ship> = {
  EXPORTACION: Ship,
  IMPORTACION: PackageOpen,
};

/**
 * Prevención de errores: vehículos y conductores con documentos vencidos se muestran
 * deshabilitados con el motivo, en lugar de dejar que el turno se rechace después.
 */
export const SeccionVehiculoConductor = ({ vehiculos, conductores }: SeccionVehiculoConductorProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CrearTurnoFormulario>();

  // OCI-001: elegir una carga refrigerada activa la prioridad y pide el certificado del ICA
  const cambiarTipoCarga = (tipoCarga: string) => {
    setValue('tipoCarga', tipoCarga, { shouldValidate: true });
    setValue('cargaRefrigerada', TIPOS_CARGA_REFRIGERADA.includes(tipoCarga));
  };
  const [vehiculoId, conductorId] = useWatch({ control, name: ['vehiculoId', 'conductorId'] });

  const opcionesVehiculo = vehiculos.map((vehiculo) => {
    const documentoVencido = evaluarDocumentosVehiculo(vehiculo).find((documento) => documento.semaforo === 'VENCIDO');
    const runtInactivo = vehiculo.estadoRunt !== 'ACTIVO';
    return {
      valor: vehiculo.id,
      etiqueta: `${vehiculo.placa} · ${vehiculo.tipo}`,
      detalle: documentoVencido ? `${documentoVencido.nombre} vencido` : runtInactivo ? 'Registro RUNT inactivo' : vehiculo.marca,
      deshabilitada: Boolean(documentoVencido) || runtInactivo,
    };
  });

  const opcionesConductor = conductores.map((conductor) => {
    const licenciaVencida = evaluarDocumentosConductor(conductor)[0].semaforo === 'VENCIDO';
    return {
      valor: conductor.id,
      etiqueta: conductor.nombre,
      detalle: licenciaVencida ? 'Licencia vencida' : `Licencia ${conductor.categoriaLicencia}`,
      deshabilitada: licenciaVencida,
    };
  });

  const vehiculoSeleccionado = vehiculos.find((vehiculo) => vehiculo.id === vehiculoId);
  const conductorSeleccionado = conductores.find((conductor) => conductor.id === conductorId);
  const documentosPorVencer = [
    ...(vehiculoSeleccionado ? evaluarDocumentosVehiculo(vehiculoSeleccionado) : []),
    ...(conductorSeleccionado ? evaluarDocumentosConductor(conductorSeleccionado) : []),
  ].filter((documento) => documento.semaforo === 'POR_VENCER');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoFormulario idCampo="vehiculoId" etiqueta="Vehículo" error={errors.vehiculoId?.message} ayuda="Los vehículos con documentos vencidos no se pueden elegir.">
        <Controller
          control={control}
          name="vehiculoId"
          render={({ field }) => (
            <SelectorOpciones
              id="vehiculoId"
              valor={field.value}
              opciones={opcionesVehiculo}
              textoVacio="Selecciona la placa"
              invalido={Boolean(errors.vehiculoId)}
              alCambiar={cambiarTipoCarga}
              alSalir={field.onBlur}
            />
          )}
        />
      </CampoFormulario>
      <CampoFormulario idCampo="conductorId" etiqueta="Conductor" error={errors.conductorId?.message}>
        <Controller
          control={control}
          name="conductorId"
          render={({ field }) => (
            <SelectorOpciones
              id="conductorId"
              valor={field.value}
              opciones={opcionesConductor}
              textoVacio="Selecciona el conductor"
              invalido={Boolean(errors.conductorId)}
              alCambiar={field.onChange}
              alSalir={field.onBlur}
            />
          )}
        />
      </CampoFormulario>

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium">Tipo de operación</legend>
        <Controller
          control={control}
          name="tipoOperacion"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={(valor) => field.onChange(valor as TipoOperacion)} className="grid-cols-2">
              {(Object.keys(ETIQUETAS_OPERACION) as TipoOperacion[]).map((operacion) => {
                const Icono = ICONO_OPERACION[operacion];
                return (
                  <Label
                    key={operacion}
                    htmlFor={`operacion-${operacion}`}
                    className={cn(
                      'flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 font-normal transition-colors hover:bg-muted/60',
                      field.value === operacion && 'border-primary bg-primary/5',
                    )}
                  >
                    <RadioGroupItem id={`operacion-${operacion}`} value={operacion} />
                    <Icono className="size-4 text-muted-foreground" aria-hidden />
                    {ETIQUETAS_OPERACION[operacion]}
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        />
        {errors.tipoOperacion && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.tipoOperacion.message}
          </p>
        )}
      </fieldset>
      <CampoFormulario idCampo="tipoCarga" etiqueta="Tipo de carga" error={errors.tipoCarga?.message}>
        <Controller
          control={control}
          name="tipoCarga"
          render={({ field }) => (
            <SelectorOpciones
              id="tipoCarga"
              valor={field.value}
              opciones={TIPOS_CARGA.map((tipo) => ({ valor: tipo, etiqueta: tipo }))}
              invalido={Boolean(errors.tipoCarga)}
              alCambiar={field.onChange}
              alSalir={field.onBlur}
            />
          )}
        />
      </CampoFormulario>

      {documentosPorVencer.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10 sm:col-span-2">
          <AlertTriangle className="text-amber-600" aria-hidden />
          <AlertTitle>Documentos próximos a vencer</AlertTitle>
          <AlertDescription>
            {documentosPorVencer.map((documento) => `${documento.nombre} (${documento.diasRestantes} días)`).join(' · ')}. Si vencen antes del
            turno, la validación lo rechazará.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
