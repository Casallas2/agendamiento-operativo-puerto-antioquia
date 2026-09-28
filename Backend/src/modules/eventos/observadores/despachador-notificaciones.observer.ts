import { Injectable, type OnModuleInit } from '@nestjs/common';
import { NotificacionesService } from 'src/modules/notificaciones/notificaciones.service';
import { BusEventosService } from '../bus-eventos.service';
import type { EventoDominio, ObservadorEvento } from '../types';

/**
 * Observador de dominio que traduce cada evento en notificaciones persistidas.
 * Se registra solo en el bus al arrancar el módulo (patrón Observer).
 */
@Injectable()
export class DespachadorNotificaciones implements ObservadorEvento, OnModuleInit {
  readonly nombre = 'DespachadorNotificaciones';

  constructor(
    private readonly busEventos: BusEventosService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  onModuleInit(): void {
    this.busEventos.registrarObservador(this);
  }

  async actualizar(evento: EventoDominio): Promise<void> {
    await this.notificacionesService.registrarEvento(evento);
  }
}
