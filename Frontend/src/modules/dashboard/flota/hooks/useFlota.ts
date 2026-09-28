'use client';

import { useQuery } from '@tanstack/react-query';
import { flotaService } from '../services/flota.service';

export const useGetVehiculos = () =>
  useQuery({
    queryKey: ['flota', 'vehiculos'],
    queryFn: flotaService.obtenerVehiculos,
  });

export const useGetConductores = () =>
  useQuery({
    queryKey: ['flota', 'conductores'],
    queryFn: flotaService.obtenerConductores,
  });
