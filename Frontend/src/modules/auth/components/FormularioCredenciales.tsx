'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampoFormulario } from '@/components/shared/CampoFormulario';
import { credencialesSchema, type CredencialesFormulario } from '@/lib/validators';

interface FormularioCredencialesProps {
  estaEnviando: boolean;
  alEnviar: (datos: CredencialesFormulario) => void;
}

export const FormularioCredenciales = ({ estaEnviando, alEnviar }: FormularioCredencialesProps) => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredencialesFormulario>({
    resolver: zodResolver(credencialesSchema),
    defaultValues: { correo: '', contrasena: '' },
  });

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-5" noValidate>
      <CampoFormulario idCampo="correo" etiqueta="Correo electrónico" error={errors.correo?.message}>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.co"
          className="h-11"
          aria-invalid={Boolean(errors.correo)}
          {...register('correo')}
        />
      </CampoFormulario>

      <CampoFormulario idCampo="contrasena" etiqueta="Contraseña" error={errors.contrasena?.message}>
        <div className="relative">
          <Input
            id="contrasena"
            type={mostrarContrasena ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 pr-11"
            aria-invalid={Boolean(errors.contrasena)}
            {...register('contrasena')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setMostrarContrasena((valorActual) => !valorActual)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarContrasena ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>
      </CampoFormulario>

      <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={estaEnviando}>
        {estaEnviando ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn aria-hidden />}
        {estaEnviando ? 'Verificando…' : 'Continuar'}
      </Button>
    </form>
  );
};
