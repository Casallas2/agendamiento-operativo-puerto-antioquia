import {
  Catch, HttpException, HttpStatus, Logger,
  type ArgumentsHost, type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type CuerpoExcepcion = { message?: string | string[]; error?: string };

/**
 * Normaliza TODOS los errores al contrato `{ status, message }`.
 * Reason: `obtenerMensajeError` del frontend muestra `message` tal cual al usuario,
 * por eso aquí se consolida a un único texto en español.
 */
@Catch()
export class FiltroExcepcionesHttp implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionesHttp.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();
    const peticion = contexto.getRequest<Request>();

    const estado = excepcion instanceof HttpException
      ? excepcion.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const mensaje = this.extraerMensaje(excepcion, estado);

    if (estado >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${peticion.method} ${peticion.url} → ${estado}`, (excepcion as Error)?.stack);
    } else {
      this.logger.warn(`${peticion.method} ${peticion.url} → ${estado}: ${mensaje}`);
    }

    respuesta.status(estado).json({ status: estado, message: mensaje });
  }

  /** Junta los mensajes de class-validator en una sola frase legible */
  private extraerMensaje(excepcion: unknown, estado: number): string {
    if (excepcion instanceof HttpException) {
      const cuerpo = excepcion.getResponse();
      if (typeof cuerpo === 'string') {
        return cuerpo;
      }
      const { message } = cuerpo as CuerpoExcepcion;
      if (Array.isArray(message)) {
        return message.join('. ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }
    return estado === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.'
      : 'No se pudo completar la solicitud.';
  }
}
