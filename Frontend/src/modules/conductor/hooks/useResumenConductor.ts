'use client';

import { useQuery } from '@tanstack/react-query';
import { conductorService } from '../services/conductor.service';

export const useGetResumenConductor = () =>
  useQuery({
    queryKey: ['conductor', 'resumen'],
    queryFn: conductorService.obtenerResumen,
    refetchInterval: 60 * 1000,
  });
