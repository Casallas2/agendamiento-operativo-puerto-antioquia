'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useValorCliente } from '@/hooks/useEstaEnCliente';
import {
  crearReconocimientoVoz,
  describirErrorReconocimiento,
  detenerVoz,
  leerTextoEnVoz,
  normalizarTexto,
  precargarVoces,
  soportaReconocimientoVoz,
  type ReconocimientoVoz,
} from '@/lib/voz';
import type { ComandoVoz } from '../types/conductor.types';

/** Si el navegador no devuelve nada en este tiempo, se corta para no dejar el botón colgado */
const MILISEGUNDOS_LIMITE_ESCUCHA = 12_000;

const PALABRAS_CLAVE: { comando: ComandoVoz; palabras: string[] }[] = [
  { comando: 'EN_CAMINO', palabras: ['camino', 'salgo', 'voy para', 'iniciar viaje', 'arranco'] },
  { comando: 'NOVEDAD', palabras: ['novedad', 'problema', 'varado', 'tranco', 'trancon', 'falla'] },
  { comando: 'DOCUMENTOS', palabras: ['documento', 'soat', 'licencia', 'tecnomecanica', 'papeles'] },
  { comando: 'AVISOS', palabras: ['aviso', 'notificacion', 'mensaje', 'alerta'] },
  { comando: 'TURNO', palabras: ['turno', 'hora', 'muelle', 'ventana', 'cita'] },
  { comando: 'AYUDA', palabras: ['ayuda', 'que puedo', 'comandos'] },
];

export const interpretarComando = (transcripcion: string): ComandoVoz | null => {
  const textoNormalizado = normalizarTexto(transcripcion);
  return (
    PALABRAS_CLAVE.find(({ palabras }) =>
      palabras.some((palabra) => textoNormalizado.includes(palabra)),
    )?.comando ?? null
  );
};

/**
 * Escucha una frase corta y la traduce a un comando de cabina.
 *
 * Reason: se reconoce por palabras clave y no por frases exactas para tolerar el ruido del
 * motor y las distintas formas de hablar. Todo fallo se informa en voz alta y por pantalla:
 * en cabina, un micrófono que falla en silencio es indistinguible de uno que no funciona.
 */
export const useComandosVoz = (alReconocerComando: (comando: ComandoVoz) => void) => {
  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const [ultimaTranscripcion, setUltimaTranscripcion] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');
  const esCompatible = useValorCliente(soportaReconocimientoVoz, false);

  const reconocimientoRef = useRef<ReconocimientoVoz | null>(null);
  const temporizadorRef = useRef<number | null>(null);
  // Reason: el callback cambia de identidad con cada turno; se guarda en una ref para que
  // los manejadores del reconocimiento siempre llamen a la versión vigente.
  const alReconocerRef = useRef(alReconocerComando);

  useEffect(() => {
    alReconocerRef.current = alReconocerComando;
  }, [alReconocerComando]);

  // Carga las voces del sistema por adelantado para que la primera locución suene en español
  useEffect(() => precargarVoces(), []);

  const limpiarTemporizador = useCallback(() => {
    if (temporizadorRef.current !== null) {
      window.clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
  }, []);

  const cerrarEscucha = useCallback(() => {
    limpiarTemporizador();
    setEstaEscuchando(false);
  }, [limpiarTemporizador]);

  useEffect(() => {
    const temporizador = temporizadorRef;
    const reconocimiento = reconocimientoRef;
    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }
      reconocimiento.current?.abort();
    };
  }, []);

  const iniciarEscucha = useCallback(() => {
    if (estaEscuchando) {
      return;
    }

    const reconocimiento = crearReconocimientoVoz();
    if (!reconocimiento) {
      const aviso = 'Este navegador no permite comandos de voz. Usa los botones grandes.';
      setMensajeEstado(aviso);
      void leerTextoEnVoz(aviso);
      return;
    }

    // El asistente no puede escucharse a sí mismo: se calla antes de abrir el micrófono
    detenerVoz();
    setUltimaTranscripcion('');
    setMensajeEstado('');

    reconocimiento.onresult = (evento) => {
      const transcripcion = evento.results[0]?.[0]?.transcript ?? '';
      setUltimaTranscripcion(transcripcion);

      const comando = interpretarComando(transcripcion);
      if (comando) {
        alReconocerRef.current(comando);
        return;
      }
      const aviso = 'No entendí. Puedes decir: mi turno, documentos, avisos, voy en camino o novedad.';
      setMensajeEstado(aviso);
      void leerTextoEnVoz(aviso);
    };

    // Antes solo se avisaba de la falta de permiso; el resto de fallos quedaban mudos
    reconocimiento.onerror = (evento) => {
      cerrarEscucha();
      if (evento.error === 'aborted') {
        return;
      }
      const aviso = describirErrorReconocimiento(evento.error);
      setMensajeEstado(aviso);
      void leerTextoEnVoz(aviso);
    };

    reconocimiento.onend = cerrarEscucha;

    reconocimientoRef.current = reconocimiento;

    try {
      reconocimiento.start();
      setEstaEscuchando(true);
      // Red de seguridad: en algunos navegadores `onend` no llega nunca
      temporizadorRef.current = window.setTimeout(() => {
        reconocimientoRef.current?.abort();
        cerrarEscucha();
      }, MILISEGUNDOS_LIMITE_ESCUCHA);
    } catch {
      // `start()` lanza si ya había una sesión abierta: se deja el botón utilizable
      cerrarEscucha();
      const aviso = 'El micrófono está ocupado. Intenta de nuevo.';
      setMensajeEstado(aviso);
      void leerTextoEnVoz(aviso);
    }
  }, [cerrarEscucha, estaEscuchando]);

  const detenerEscucha = useCallback(() => {
    // `abort()` y no `stop()`: al cancelar a propósito no debe interpretarse lo ya oído
    reconocimientoRef.current?.abort();
    cerrarEscucha();
  }, [cerrarEscucha]);

  return {
    estaEscuchando,
    ultimaTranscripcion,
    mensajeEstado,
    esCompatible,
    iniciarEscucha,
    detenerEscucha,
  };
};
