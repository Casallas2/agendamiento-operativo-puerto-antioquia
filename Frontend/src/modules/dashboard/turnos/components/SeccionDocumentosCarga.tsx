'use client';

import { Info, Snowflake, Wand2 } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CampoFormulario } from '@/components/shared/CampoFormulario';
import { LONGITUD_MAXIMA_OBSERVACIONES, type CrearTurnoFormulario } from '@/lib/validators';

const DOCUMENTOS_EJEMPLO = {
  numeroManifiesto: 'MAN-2026-004561',
  numeroBl: 'BL-PA-88275',
  numeroCertificadoIca: 'CFE-2026-001204',
};

export const SeccionDocumentosCarga = () => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CrearTurnoFormulario>();
  const [observaciones, cargaRefrigerada] = useWatch({ control, name: ['observaciones', 'cargaRefrigerada'] });

  const completarEjemplo = () => {
    setValue('numeroManifiesto', DOCUMENTOS_EJEMPLO.numeroManifiesto, { shouldValidate: true });
    setValue('numeroBl', DOCUMENTOS_EJEMPLO.numeroBl, { shouldValidate: true });
    if (cargaRefrigerada) {
      setValue('numeroCertificadoIca', DOCUMENTOS_EJEMPLO.numeroCertificadoIca, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario idCampo="numeroManifiesto" etiqueta="Número de manifiesto de carga" ayuda="Formato: MAN-AAAA-000000" error={errors.numeroManifiesto?.message}>
          <Input
            id="numeroManifiesto"
            placeholder="MAN-2026-004561"
            autoComplete="off"
            className="h-10 font-mono uppercase"
            aria-invalid={Boolean(errors.numeroManifiesto)}
            {...register('numeroManifiesto')}
          />
        </CampoFormulario>
        <CampoFormulario idCampo="numeroBl" etiqueta="Conocimiento de embarque (BL)" ayuda="Formato: BL-XX-00000" error={errors.numeroBl?.message}>
          <Input
            id="numeroBl"
            placeholder="BL-PA-88275"
            autoComplete="off"
            className="h-10 font-mono uppercase"
            aria-invalid={Boolean(errors.numeroBl)}
            {...register('numeroBl')}
          />
        </CampoFormulario>
      </div>

      <div className="space-y-4 rounded-lg border border-info/30 bg-info/5 p-4">
        <Controller
          control={control}
          name="cargaRefrigerada"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4">
              <Label htmlFor="cargaRefrigerada" className="flex cursor-pointer items-start gap-2.5 font-normal">
                <Snowflake className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
                <span className="space-y-0.5">
                  <span className="block font-medium">Contenedor refrigerado (cadena de frío)</span>
                  <span className="block text-xs text-muted-foreground">
                    Usa la cuota prioritaria de cada franja y requiere el certificado fitosanitario del ICA.
                  </span>
                </span>
              </Label>
              <Switch id="cargaRefrigerada" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
        {cargaRefrigerada && (
          <CampoFormulario
            idCampo="numeroCertificadoIca"
            etiqueta="Certificado fitosanitario de exportación (ICA)"
            ayuda="Formato: CFE-AAAA-000000"
            error={errors.numeroCertificadoIca?.message}
          >
            <Input
              id="numeroCertificadoIca"
              placeholder="CFE-2026-001204"
              autoComplete="off"
              className="h-10 bg-background font-mono uppercase"
              aria-invalid={Boolean(errors.numeroCertificadoIca)}
              {...register('numeroCertificadoIca')}
            />
          </CampoFormulario>
        )}
      </div>

      <Alert role="note" className="border-info/30 bg-info/5">
        <Info className="text-info" aria-hidden />
        <AlertTitle>Datos de prueba</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Un manifiesto que no esté registrado en la DIAN (p. ej. MAN-2026-009999) o un certificado que el ICA no haya
            expedido (p. ej. CFE-2026-009999) será rechazado en la validación automática.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={completarEjemplo}>
            <Wand2 aria-hidden />
            Usar datos de ejemplo
          </Button>
        </AlertDescription>
      </Alert>

      <CampoFormulario
        idCampo="observaciones"
        etiqueta="Observaciones para el operador (opcional)"
        ayuda={`Carga sobredimensionada, requerimientos de refrigeración, etc. · ${observaciones?.length ?? 0}/${LONGITUD_MAXIMA_OBSERVACIONES}`}
        error={errors.observaciones?.message}
      >
        <Textarea
          id="observaciones"
          rows={3}
          maxLength={LONGITUD_MAXIMA_OBSERVACIONES}
          placeholder="Ej.: contenedor reefer, requiere conexión eléctrica al llegar"
          aria-invalid={Boolean(errors.observaciones)}
          {...register('observaciones')}
        />
      </CampoFormulario>
    </div>
  );
};
