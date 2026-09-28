'use client';

import { useQuery } from '@tanstack/react-query';
import { turnosService } from '../services/turnos.service';
import type { FiltroTurnos } from '../types/turnos.types';

export const useGetTurnos = (filtro: FiltroTurnos = {}) =>
  useQuery({
    queryKey: ['turnos', filtro],
    queryFn: () => turnosService.obtenerTurnos(filtro),
  });

export const useGetTurno = (turnoId: string) =>
  useQuery({
    queryKey: ['turnos', 'detalle', turnoId],
    queryFn: () => turnosService.obtenerTurno(turnoId),
    retry: false,
  });

export const useGetFranjas = (fecha: string) =>
  useQuery({
    queryKey: ['franjas', fecha],
    queryFn: () => turnosService.obtenerFranjas(fecha),
    enabled: Boolean(fecha),
  });
