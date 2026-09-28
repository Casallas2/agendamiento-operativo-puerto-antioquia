'use client';

import { useSyncExternalStore } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

const suscribir = (alCambiar: () => void) => {
  const consulta = window.matchMedia(CONSULTA);
  consulta.addEventListener('change', alCambiar);
  return () => consulta.removeEventListener('change', alCambiar);
};

const leerDelNavegador = () => window.matchMedia(CONSULTA).matches;

// En el servidor no hay preferencia que consultar; se asume que el movimiento está permitido
// y el primer render del cliente corrige el valor sin provocar un render en cascada.
const leerDelServidor = () => false;

/**
 * Indica si el sistema pide menos movimiento (WCAG 2.3.3).
 * El CSS ya neutraliza las animaciones; este hook existe para lo que el CSS no alcanza,
 * como detener el avance automático del carrusel en lugar de limitarse a acelerarlo.
 */
export const usePrefiereMenosMovimiento = () =>
  useSyncExternalStore(suscribir, leerDelNavegador, leerDelServidor);
