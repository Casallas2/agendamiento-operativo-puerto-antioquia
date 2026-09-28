import axios from 'axios';

/** Contrato de respuesta obligatorio del backend: { status, message, data } */
export interface RespuestaApi<Datos> {
  status: number;
  message: string;
  data: Datos;
}

/** Respuesta sin cuerpo de datos (cierres de sesión, marcados, reinicios) */
export interface RespuestaApiVacia {
  status: number;
  message: string;
}

export class ErrorApi extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

export const construirRespuesta = <Datos>(status: number, message: string, data: Datos): RespuestaApi<Datos> => ({
  status,
  message,
  data,
});

/**
 * Mensaje que se le muestra al usuario cuando algo falla.
 * Reason: el backend responde `{ status, message }` con el texto ya redactado en español,
 * así que se prefiere ese mensaje antes que el genérico de Axios ("Request failed with...").
 */
export const obtenerMensajeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { message?: string } | undefined)?.message;
    if (mensaje) {
      return mensaje;
    }
    if (!error.response) {
      return 'No pudimos contactar al servidor. Revisa tu conexión e intenta de nuevo.';
    }
  }
  if (error instanceof ErrorApi || error instanceof Error) {
    return error.message;
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
};
