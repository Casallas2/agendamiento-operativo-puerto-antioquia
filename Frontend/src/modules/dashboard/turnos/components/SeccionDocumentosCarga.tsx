'use client';

import { Info, Wand2 } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CampoFormulario } from '@/components/shared/CampoFormulario';
import { LONGITUD_MAXIMA_OBSERVACIONES, type CrearTurnoFormulario } from '@/lib/validators';

const DOCUMENTOS_EJEMPLO = { numeroManifiesto: 'MAN-2026-004561', numeroBl: 'BL-PA-88275' };

export const SeccionDocumentosCarga = () => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CrearTurnoFormulario>();
  const observaciones = useWatch({ control, name: 'observaciones' });

  const completarEjemplo = () => {
    setValue('numeroManifiesto', DOCUMENTOS_EJEMPLO.numeroManifiesto, { shouldValidate: true });
    setValue('numeroBl', DOCUMENTOS_EJEMPLO.numeroBl, { shouldValidate: true });
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

      <Alert role="note" className="border-info/30 bg-info/5">
        <Info className="text-info" aria-hidden />
        <AlertTitle>Datos de prueba</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Un manifiesto que no esté registrado en la DIAN (p. ej. MAN-2026-009999) será rechazado en la validación automática.</p>
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
