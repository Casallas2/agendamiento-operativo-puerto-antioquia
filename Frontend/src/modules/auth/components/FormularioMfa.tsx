'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampoFormulario } from '@/components/shared/CampoFormulario';
import { CODIGO_MFA_DEMO } from '@/core/config/catalogos';
import { codigoMfaSchema, type CodigoMfaFormulario } from '@/lib/validators';
import type { DesafioMfa } from '../types/auth.types';

interface FormularioMfaProps {
  desafio: DesafioMfa;
  estaEnviando: boolean;
  alEnviar: (datos: CodigoMfaFormulario) => void;
  alVolver: () => void;
}

export const FormularioMfa = ({ desafio, estaEnviando, alEnviar, alVolver }: FormularioMfaProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodigoMfaFormulario>({
    resolver: zodResolver(codigoMfaSchema),
    defaultValues: { codigo: '' },
  });

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-5" noValidate>
      <Alert role="status" className="border-primary/20 bg-primary/5 p-4">
        <ShieldCheck className="text-primary" aria-hidden />
        <AlertTitle>Hola, {desafio.nombreUsuario}</AlertTitle>
        <AlertDescription>
          Enviamos un código de 6 dígitos por SMS al <strong>{desafio.telefonoEnmascarado}</strong>.
        </AlertDescription>
      </Alert>

      <CampoFormulario
        idCampo="codigo"
        etiqueta="Código de verificación"
        ayuda={`Prototipo: usa el código ${CODIGO_MFA_DEMO}`}
        error={errors.codigo?.message}
      >
        <Input
          id="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          autoFocus
          className="h-14 text-center font-mono text-2xl tracking-[0.5em] md:text-2xl"
          aria-invalid={Boolean(errors.codigo)}
          {...register('codigo')}
        />
      </CampoFormulario>

      <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={estaEnviando}>
        {estaEnviando ? <Loader2 className="animate-spin" aria-hidden /> : <ShieldCheck aria-hidden />}
        {estaEnviando ? 'Validando código…' : 'Verificar e ingresar'}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={alVolver}>
        <ArrowLeft aria-hidden />
        Usar otra cuenta
      </Button>
    </form>
  );
};
