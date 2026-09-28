'use client';

import { useSyncExternalStore } from 'react';

const suscribirSinCambios = () => () => undefined;

/**
 * Evalúa un valor que solo existe en el navegador (tema, APIs de voz) sin desajustes de hidratación:
 * en el servidor devuelve el valor por defecto y en el cliente el valor real.
 */
export const useValorCliente = <Valor>(obtenerValorCliente: () => Valor, valorServidor: Valor) =>
  useSyncExternalStore(suscribirSinCambios, obtenerValorCliente, () => valorServidor);
