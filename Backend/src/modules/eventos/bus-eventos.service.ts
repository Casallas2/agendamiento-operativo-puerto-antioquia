import { Injectable, Logger } from '@nestjs/common';
import { Subject, type Observable } from 'rxjs';
import type { EventoDominio, EventoPublicable, ObservadorEvento } from './types';

/**
 * Sujeto del patrón Observer: sustituye al Event Bus (Kafka/RabbitMQ) del diseño.
 * - Los observadores de dominio reaccionan en el servidor (persistir notificaciones).
 * - El flujo `Observable` alimenta el canal SSE que empuja los eventos al navegador (RF-03).
 */
@Injectable()
export class BusEventosService {
  private readonly logger = new Logger(BusEventosService.name);
  private readonly observadores = new Set<ObservadorEvento>();
  private readonly flujo = new Subject<EventoDominio>();

  registrarObservador(observador: ObservadorEvento): void {
    this.observadores.add(observador);
    this.logger.log(`Observador registrado: ${observador.nombre}`);
  }

  eliminarObservador(observador: ObservadorEvento): void {
    this.observadores.delete(observador);
  }

  /** Flujo consumido por el controlador SSE */
  get eventos$(): Observable<EventoDominio> {
    return this.flujo.asObservable();
  }

  /**
   * Publica un evento: primero lo procesan los observadores de dominio y después se
   * empuja a los clientes conectados. Un observador que falle no tumba la operación.
   */
  async publicar(evento: EventoPublicable): Promise<EventoDominio> {
    const eventoCompleto: EventoDominio = { ...evento, ocurridoEn: new Date().toISOString() };

    for (const observador of this.observadores) {
      try {
        await observador.actualizar(eventoCompleto);
      } catch (error) {
        this.logger.error(
          `El observador ${observador.nombre} falló al procesar ${eventoCompleto.tipo}`,
          (error as Error)?.stack,
        );
      }
    }

    this.flujo.next(eventoCompleto);
    return eventoCompleto;
  }
}
