'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { mostrarAlertaError } from '@/lib/alertas';
import type { CodigoMfaFormulario, CredencialesFormulario } from '@/lib/validators';
import { FormularioCredenciales } from '../components/FormularioCredenciales';
import { FormularioMfa } from '../components/FormularioMfa';
import { obtenerMensajeError, obtenerRutaInicio, useIniciarSesion, useVerificarMfa } from '../hooks/useLogin';
import type { DesafioMfa } from '../types/auth.types';

export const LoginView = () => {
  const router = useRouter();
  const [desafio, setDesafio] = useState<DesafioMfa | null>(null);
  const iniciarSesion = useIniciarSesion();
  const verificarMfa = useVerificarMfa();
  const haHidratado = useAuthStore((estado) => estado._hasHydrated);
  const usuarioVentana = useAuthStore((estado) => estado.user);

  useEffect(() => {
    if (haHidratado && usuarioVentana && !verificarMfa.isPending) {
      router.replace(obtenerRutaInicio(usuarioVentana));
    }
  }, [haHidratado, usuarioVentana, verificarMfa.isPending, router]);

  const enviarCredenciales = (credenciales: CredencialesFormulario) => {
    iniciarSesion.mutate(credenciales, {
      onSuccess: setDesafio,
      onError: (error) => void mostrarAlertaError('No pudimos iniciar sesión', obtenerMensajeError(error)),
    });
  };

  const enviarCodigo = ({ codigo }: CodigoMfaFormulario) => {
    if (!desafio) {
      return;
    }
    verificarMfa.mutate(
      { desafioId: desafio.desafioId, codigo },
      {
        onError: (error) => {
          const mensaje = obtenerMensajeError(error);
          void mostrarAlertaError('Verificación fallida', mensaje);
          if (mensaje.includes('intentos permitidos') || mensaje.includes('expiró')) {
            setDesafio(null);
          }
        },
      },
    );
  };

  return (
    <div className="w-full space-y-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {desafio ? 'Confirma que eres tú' : 'Inicia sesión'}
      </h1>

      {desafio ? (
        <FormularioMfa
          desafio={desafio}
          estaEnviando={verificarMfa.isPending}
          alEnviar={enviarCodigo}
          alVolver={() => setDesafio(null)}
        />
      ) : (
        <FormularioCredenciales estaEnviando={iniciarSesion.isPending} alEnviar={enviarCredenciales} />
      )}
    </div>
  );
};
