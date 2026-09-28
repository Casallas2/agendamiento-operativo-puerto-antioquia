'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { obtenerAreaSesion, URL_API } from '@/core/api/api';
import { useAuthStore } from '@/core/store/authStore';
import { useUiStore } from '@/core/store/uiStore';
import { mostrarAvisoEmergente } from '@/lib/alertas';
import { leerTextoEnVoz } from '@/lib/voz';
import type { EventoDominio } from '../types/notificaciones.types';

/**
 * Cliente del canal de tiempo real del API Gateway (RF-03).
 * Se conecta por SSE a `/events/stream`: cada evento del bus refresca las consultas y,
 * si el usuario es destinatario, muestra el aviso (y lo lee en voz si es conductor).
 *
 * Reason: se usa `EventSource` en vez de WebSocket porque es nativo del navegador, reconecta
 * solo tras una caída y viaja sobre la misma cookie de sesión, sin dependencias extra.
 * Como no admite cabeceras propias, el área se declara por query string.
 */
export const useEscucharTiempoReal = () => {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((estado) => estado.user);
  const lecturaEnVozActiva = useUiStore((estado) => estado.lecturaEnVozActiva);
  const avisosEmergentesActivos = useUiStore((estado) => estado.avisosEmergentesActivos);

  useEffect(() => {
    if (!usuario) {
      return undefined;
    }

    const fuente = new EventSource(`${URL_API}/events/stream?area=${obtenerAreaSesion()}`, {
      withCredentials: true,
    });

    fuente.onmessage = (mensaje) => {
      const evento = JSON.parse(mensaje.data) as EventoDominio;

      if (evento.tipo === 'ValidacionActualizada') {
        void queryClient.invalidateQueries({ queryKey: ['turnos'] });
        return;
      }
      void queryClient.invalidateQueries({ predicate: (consulta) => consulta.queryKey[0] !== 'auth' });

      if (!evento.usuariosAfectados.includes(usuario.id)) {
        return;
      }
      // Reason: en cabina el aviso visual nunca se silencia (R-01); la preferencia solo aplica al portal
      if (avisosEmergentesActivos || usuario.rol === 'CONDUCTOR') {
        void mostrarAvisoEmergente(evento.titulo, evento.descripcion, evento.severidad);
      }
      if (usuario.rol === 'CONDUCTOR' && lecturaEnVozActiva) {
        leerTextoEnVoz(`${evento.titulo}. ${evento.descripcion}`);
      }
    };

    return () => fuente.close();
  }, [queryClient, usuario, lecturaEnVozActiva, avisosEmergentesActivos]);
};
