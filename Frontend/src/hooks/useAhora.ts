'use client';

import { useEffect, useState } from 'react';

/** Marca de tiempo que se refresca periódicamente sin romper la pureza del render */
export const useAhora = (intervaloMilisegundos = 30 * 1000) => {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), intervaloMilisegundos);
    return () => clearInterval(intervalo);
  }, [intervaloMilisegundos]);

  return ahora;
};
