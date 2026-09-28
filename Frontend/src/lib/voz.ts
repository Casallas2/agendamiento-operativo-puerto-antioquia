/**
 * Utilidades de voz para la cabina (R-01) basadas en la Web Speech API del navegador.
 * Reason: la API de reconocimiento no está en los tipos DOM de TypeScript, por eso se
 * declara aquí el contrato mínimo que se usa.
 */

interface ResultadoReconocimiento {
  readonly transcript: string;
}

interface EventoResultadoVoz {
  readonly results: ArrayLike<ArrayLike<ResultadoReconocimiento>>;
}

export type ErrorReconocimiento =
  | 'no-speech'
  | 'audio-capture'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'network'
  | 'aborted'
  | 'language-not-supported'
  | string;

export interface ReconocimientoVoz {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((evento: EventoResultadoVoz) => void) | null;
  onerror: ((evento: { error: ErrorReconocimiento }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type ConstructorReconocimiento = new () => ReconocimientoVoz;

const obtenerConstructorReconocimiento = (): ConstructorReconocimiento | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const ventanaExtendida = window as unknown as {
    SpeechRecognition?: ConstructorReconocimiento;
    webkitSpeechRecognition?: ConstructorReconocimiento;
  };
  return ventanaExtendida.SpeechRecognition ?? ventanaExtendida.webkitSpeechRecognition ?? null;
};

export const soportaReconocimientoVoz = () => obtenerConstructorReconocimiento() !== null;

export const crearReconocimientoVoz = () => {
  const Constructor = obtenerConstructorReconocimiento();
  if (!Constructor) {
    return null;
  }
  const reconocimiento = new Constructor();
  reconocimiento.lang = 'es-CO';
  reconocimiento.continuous = false;
  reconocimiento.interimResults = false;
  reconocimiento.maxAlternatives = 1;
  return reconocimiento;
};

/** Mensaje hablado para cada fallo del reconocimiento */
export const describirErrorReconocimiento = (error: ErrorReconocimiento): string => {
  const mensajes: Record<string, string> = {
    'no-speech': 'No escuché nada. Toca el micrófono y habla de nuevo.',
    'audio-capture': 'No encuentro el micrófono. Revisa que esté conectado.',
    'not-allowed': 'Necesito permiso para usar el micrófono. Actívalo en el navegador.',
    'service-not-allowed': 'Necesito permiso para usar el micrófono. Actívalo en el navegador.',
    network: 'Sin conexión para reconocer la voz. Usa los botones grandes.',
    'language-not-supported': 'Este navegador no reconoce español. Usa los botones grandes.',
  };
  return mensajes[error] ?? 'No pude escucharte. Intenta otra vez o usa los botones grandes.';
};

// ─── Síntesis de voz ─────────────────────────────────────────────────────────

const obtenerSintetizador = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

/**
 * Chrome devuelve una lista vacía en la primera llamada a `getVoices()` porque las carga
 * de forma asíncrona. Se cachea y se reintenta cuando el navegador avisa con `voiceschanged`,
 * si no la primera locución se lee con la voz inglesa por defecto.
 */
let vozEspanolaCacheada: SpeechSynthesisVoice | null = null;

/**
 * No todas las voces en español suenan igual de cercanas. Tomar la primera que apareciera
 * dejaba la cabina hablando con Helena, la castellana heredada, que lee plana y distante.
 * Se puntúa cada voz y gana la más cálida disponible. El acento manda sobre todo lo demás:
 * la cabina es colombiana (R-01), así que el castellano peninsular queda como último
 * recurso —se usa solo si no hay ninguna voz hispanoamericana, antes que quedarse muda—.
 *
 *  1. Hispanoamericana neuronal ("Microsoft Salome Online (Natural) - Spanish (Colombia)")
 *  2. Hispanoamericana de red   ("Google español de Estados Unidos")
 *  3. Hispanoamericana local    ("Microsoft Sabina - Spanish (Mexico)")
 *  4. Castellana, penalizada, solo como red de seguridad
 *
 * Reason: el puntaje no puede apoyarse solo en "neuronal" y "de red". Brave se compila sin
 * las llaves de Google, así que no expone ninguna voz "Google …" y solo quedan las locales
 * del sistema, todas empatadas. Por eso el nombre de la voz también puntúa: es lo único que
 * distingue a Laura (OneCore, suave) de Helena en un equipo con solo voces castellanas.
 * Además Brave inyecta una voz falsa por su protección antihuella (farbling) con un nombre
 * suelto; dar ventaja a los nombres conocidos la deja de última sin necesidad de listarla.
 */
const NOMBRES_CALIDOS = [
  // Hispanoamericanas neuronales o de red, las más cercanas al conductor
  'salome',
  'dalia',
  'ximena',
  'paloma',
  'sabina',
  'google',
  'raul',
  // Locales que suenan más naturales que la castellana heredada
  'paulina',
  'laura',
  'monica',
];
/** Todo el español americano; 'es' a secas suele ser neutro latino en navegadores móviles */
const LOCALES_CERCANOS = [
  'es-419',
  'es-mx',
  'es-us',
  'es-pe',
  'es-cl',
  'es-ar',
  'es-ve',
  'es-ec',
  'es-bo',
  'es-cr',
  'es-do',
  'es-gt',
  'es-hn',
  'es-ni',
  'es-pa',
  'es-py',
  'es-sv',
  'es-uy',
];

/** El peninsular no se descarta, pero cede ante cualquier voz americana */
const PENALIZACION_CASTELLANO = 40;

/** Solo se puntúan voces ya filtradas por idioma: aquí un puntaje negativo sigue siendo válido */
const puntuarVoz = (voz: SpeechSynthesisVoice): number => {
  const idioma = voz.lang.toLowerCase();
  // normalizarTexto quita las tildes: "Mónica" debe casar con 'monica'
  const nombre = normalizarTexto(voz.name);
  let puntaje = 0;

  // Lo que más cambia la percepción es el motor: neuronal frente a formante heredado
  if (nombre.includes('natural') || nombre.includes('online')) {
    puntaje += 60;
  }
  if (!voz.localService) {
    puntaje += 25;
  }
  if (nombre.includes('desktop')) {
    puntaje -= 25;
  }

  // Después el acento, que es lo que se pidió: latinoamericano, nunca peninsular
  if (idioma.startsWith('es-co')) {
    puntaje += 30;
  } else if (LOCALES_CERCANOS.some((local) => idioma.startsWith(local))) {
    puntaje += 22;
  } else if (idioma.startsWith('es-es')) {
    puntaje -= PENALIZACION_CASTELLANO;
  }

  // El orden de la lista importa: la primera coincidencia es la más cálida
  const posicion = NOMBRES_CALIDOS.findIndex((preferido) => nombre.includes(preferido));
  if (posicion >= 0) {
    puntaje += NOMBRES_CALIDOS.length + 1 - posicion;
  }
  return puntaje;
};

const buscarVozEspanola = (sintetizador: SpeechSynthesis): SpeechSynthesisVoice | null => {
  if (vozEspanolaCacheada) {
    return vozEspanolaCacheada;
  }
  const voces = sintetizador.getVoices();
  if (voces.length === 0) {
    return null;
  }
  const mejor = voces
    .filter((voz) => voz.lang.toLowerCase().startsWith('es'))
    .map((voz) => ({ voz, puntaje: puntuarVoz(voz) }))
    .sort((una, otra) => otra.puntaje - una.puntaje)[0];

  vozEspanolaCacheada = mejor?.voz ?? null;

  // El equipo puede no tener ninguna voz americana instalada y el fallback es silencioso:
  // sin este aviso la cabina "funciona" pero suena peninsular y nadie se entera.
  if (process.env.NODE_ENV === 'development' && vozEspanolaCacheada?.lang.toLowerCase().startsWith('es-es')) {
    console.warn(
      `[cabina] Sin voz latinoamericana instalada; se usa "${vozEspanolaCacheada.name}" (castellana). ` +
        'Instala el paquete de voz es-MX o es-CO del sistema para el acento correcto.',
    );
  }
  return vozEspanolaCacheada;
};

/**
 * Prosodia de la cabina. El tono ligeramente por encima de 1 es lo que se percibe como
 * cercano; bajar mucho el ritmo suena condescendiente, así que se deja casi natural y la
 * claridad se resuelve con frases cortas.
 */
const RITMO_VOZ = 1;
const TONO_VOZ = 1.1;

/** Se llama al montar la cabina para que la primera locución ya tenga voz en español */
export const precargarVoces = () => {
  const sintetizador = obtenerSintetizador();
  if (!sintetizador) {
    return undefined;
  }
  buscarVozEspanola(sintetizador);
  const alCambiar = () => {
    vozEspanolaCacheada = null;
    buscarVozEspanola(sintetizador);
  };
  sintetizador.addEventListener('voiceschanged', alCambiar);
  return () => sintetizador.removeEventListener('voiceschanged', alCambiar);
};

export const detenerVoz = () => {
  obtenerSintetizador()?.cancel();
};

export const estaHablando = () => Boolean(obtenerSintetizador()?.speaking);

/**
 * Lee un texto en voz alta. Devuelve una promesa que se resuelve al terminar, para poder
 * encadenar la locución con el micrófono y que el asistente no se escuche a sí mismo.
 *
 * Reason: `cancel()` seguido de `speak()` en el mismo tick hace que Chrome descarte la
 * locución, por eso se espera un instante cuando había algo sonando.
 */
export const leerTextoEnVoz = (texto: string): Promise<void> => {
  const sintetizador = obtenerSintetizador();
  if (!sintetizador || !texto.trim()) {
    return Promise.resolve();
  }

  const estabaHablando = sintetizador.speaking || sintetizador.pending;
  sintetizador.cancel();

  return new Promise<void>((resolver) => {
    const emitir = () => {
      const locucion = new SpeechSynthesisUtterance(texto);
      const vozEspanola = buscarVozEspanola(sintetizador);
      if (vozEspanola) {
        locucion.voice = vozEspanola;
      }
      locucion.lang = vozEspanola?.lang ?? 'es-CO';
      locucion.rate = RITMO_VOZ;
      locucion.pitch = TONO_VOZ;

      let terminado = false;
      const finalizar = () => {
        if (!terminado) {
          terminado = true;
          resolver();
        }
      };
      locucion.onend = finalizar;
      locucion.onerror = finalizar;

      sintetizador.speak(locucion);
    };

    if (estabaHablando) {
      window.setTimeout(emitir, 90);
    } else {
      emitir();
    }
  });
};

export const normalizarTexto = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
