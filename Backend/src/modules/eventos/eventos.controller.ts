import { Controller, Sse, type MessageEvent } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { interval, map, merge, type Observable } from 'rxjs';
import { UsuarioActual } from 'src/common/decorators';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { BusEventosService } from './bus-eventos.service';

const MILISEGUNDOS_LATIDO = 25_000;

/**
 * Canal de tiempo real (RF-03). Sustituye al WebSocket del API Gateway con SSE,
 * que el navegador consume con `EventSource` sin dependencias adicionales.
 */
@ApiTags('Eventos')
@ApiBearerAuth('cookie-auth')
@Controller('events')
export class EventosController {
  constructor(private readonly busEventos: BusEventosService) {}

  @Sse('stream')
  @ApiOperation({
    summary: 'Flujo de eventos operativos en tiempo real',
    description: 'Stream SSE con los eventos del bus. El cliente declara su área con ?area=CABINA|PORTAL',
  })
  @ApiQuery({ name: 'area', enum: ['CABINA', 'PORTAL'], required: true })
  suscribir(@UsuarioActual() usuario: UsuarioSesion): Observable<MessageEvent> {
    const eventos = this.busEventos.eventos$.pipe(
      map((evento): MessageEvent => ({ data: evento })),
    );
    // Reason: el latido evita que proxies o el navegador corten una conexión inactiva.
    // Va con `type` propio para que no llegue al `onmessage` del cliente.
    const latido = interval(MILISEGUNDOS_LATIDO).pipe(
      map((): MessageEvent => ({ type: 'latido', data: { usuarioId: usuario.id } })),
    );
    return merge(eventos, latido);
  }
}
