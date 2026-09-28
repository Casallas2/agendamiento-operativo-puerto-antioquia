'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerMensajeError } from '@/core/api/respuestaApi';
import { confirmarAccion, mostrarAlertaError, mostrarAlertaExito, solicitarDatosRetraso } from '@/lib/alertas';
import { muellesService } from '../services/muelles.service';
import type { Muelle } from '../types/muelles.types';

export const useGetMuelles = () =>
  useQuery({
    queryKey: ['muelles'],
    queryFn: muellesService.obtenerMuelles,
  });

const describirNotificados = (cantidad: number) =>
  cantidad === 0
    ? 'No había turnos próximos en este muelle.'
    : `Se notificó a ${cantidad} turno(s) por Push y SMS, y por voz a los conductores.`;

export const useAccionesMuelle = () => {
  const queryClient = useQueryClient();
  const refrescarDatos = () => {
    void queryClient.invalidateQueries({ queryKey: ['muelles'] });
    void queryClient.invalidateQueries({ queryKey: ['turnos'] });
    void queryClient.invalidateQueries({ queryKey: ['reporte'] });
  };
  const manejarError = (error: unknown) => {
    void mostrarAlertaError('No se pudo actualizar el muelle', obtenerMensajeError(error));
  };

  const mutacionRetraso = useMutation({
    mutationFn: muellesService.declararRetraso,
    onSuccess: (cantidad) => {
      refrescarDatos();
      void mostrarAlertaExito('Retraso declarado', describirNotificados(cantidad));
    },
    onError: manejarError,
  });

  const mutacionRestablecer = useMutation({
    mutationFn: muellesService.restablecerOperacion,
    onSuccess: (cantidad) => {
      refrescarDatos();
      void mostrarAlertaExito('Operación restablecida', describirNotificados(cantidad));
    },
    onError: manejarError,
  });

  const mutacionMantenimiento = useMutation({
    mutationFn: muellesService.alternarMantenimiento,
    onSuccess: refrescarDatos,
    onError: manejarError,
  });

  const declararRetraso = async (muelle: Muelle) => {
    const datos = await solicitarDatosRetraso(muelle.nombre);
    if (datos) {
      mutacionRetraso.mutate({ muelleId: muelle.id, ...datos });
    }
  };

  const restablecerOperacion = async (muelle: Muelle) => {
    const confirmado = await confirmarAccion({
      titulo: `¿Restablecer ${muelle.nombre}?`,
      texto: 'Los turnos afectados volverán a su horario original y se notificará a los conductores.',
      textoConfirmar: 'Restablecer operación',
    });
    if (confirmado) {
      mutacionRestablecer.mutate(muelle.id);
    }
  };

  const alternarMantenimiento = async (muelle: Muelle) => {
    const entraMantenimiento = muelle.estado !== 'MANTENIMIENTO';
    const confirmado = await confirmarAccion({
      titulo: entraMantenimiento ? `¿Poner ${muelle.nombre} en mantenimiento?` : `¿Habilitar ${muelle.nombre}?`,
      texto: entraMantenimiento
        ? 'El muelle dejará de aceptar nuevas reservas hasta que lo habilites de nuevo.'
        : 'El muelle volverá a aparecer disponible para los transportistas.',
      textoConfirmar: entraMantenimiento ? 'Poner en mantenimiento' : 'Habilitar muelle',
      esPeligrosa: entraMantenimiento,
    });
    if (confirmado) {
      mutacionMantenimiento.mutate(muelle.id);
    }
  };

  return {
    declararRetraso,
    restablecerOperacion,
    alternarMantenimiento,
    estaProcesando: mutacionRetraso.isPending || mutacionRestablecer.isPending || mutacionMantenimiento.isPending,
  };
};
