'use client';

import { useQuery } from '@tanstack/react-query';
import { alertasService } from '../services/alertas.service';

export const useGetReporte = () =>
  useQuery({
    queryKey: ['reporte'],
    queryFn: alertasService.obtenerReporte,
  });
