import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { aIso, construirRespuesta, construirRespuestaVacia } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import type { EventoDominio } from 'src/modules/eventos/types';
import { Usuario } from 'src/modules/users/entities';
import { Notificacion } from './entities';
import { resolverCanales } from './notificadores/canales.notificador';
import type {
  NotificacionData,
  NotificacionesLeidasResponse,
  NotificacionesResponse,
} from './types';

const LIMITE_NOTIFICACIONES = 30;

/** Eventos puramente técnicos que refrescan la interfaz pero no generan aviso al usuario */
const EVENTOS_SIN_NOTIFICACION = new Set<EventoDominio['tipo']>(['ValidacionActualizada']);

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private mapear(notificacion: Notificacion): NotificacionData {
    return {
      id: notificacion.id,
      usuarioId: notificacion.usuarioId,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      tipo: notificacion.tipo,
      canales: notificacion.canales ?? [],
      turnoId: notificacion.turnoId ?? undefined,
      leida: notificacion.leida,
      creadaEn: aIso(notificacion.creadaEn),
    };
  }

  async obtenerDeUsuario(usuario: UsuarioSesion): Promise<NotificacionesResponse> {
    const notificaciones = await this.notificacionRepository.find({
      where: { usuarioId: usuario.id },
      order: { creadaEn: 'DESC' },
      take: LIMITE_NOTIFICACIONES,
    });

    return construirRespuesta(
      200,
      'Notificaciones obtenidas',
      notificaciones.map((notificacion) => this.mapear(notificacion)),
    );
  }

  async marcarTodasLeidas(usuario: UsuarioSesion): Promise<NotificacionesLeidasResponse> {
    await this.notificacionRepository.update({ usuarioId: usuario.id, leida: false }, { leida: true });
    return construirRespuestaVacia(200, 'Notificaciones marcadas como leídas');
  }

  /**
   * Convierte un evento de dominio en notificaciones persistidas, una por destinatario.
   * Cada notificador de canal decide si entrega según la severidad y el rol (Observer).
   */
  async registrarEvento(evento: EventoDominio): Promise<void> {
    if (EVENTOS_SIN_NOTIFICACION.has(evento.tipo) || evento.usuariosAfectados.length === 0) {
      return;
    }

    const destinatarios = await this.usuarioRepository.find({
      where: { id: In(evento.usuariosAfectados), isActive: true },
    });
    if (destinatarios.length === 0) {
      return;
    }

    const notificaciones = destinatarios.map((destinatario) =>
      this.notificacionRepository.create({
        usuarioId: destinatario.id,
        titulo: evento.titulo,
        mensaje: evento.descripcion,
        tipo: evento.severidad,
        canales: resolverCanales(evento, destinatario.rol),
        turnoId: evento.turnoId ?? null,
        leida: false,
        creadaEn: new Date(evento.ocurridoEn),
      }),
    );

    await this.notificacionRepository.save(notificaciones);
    this.logger.log(`Evento ${evento.tipo} notificado a ${notificaciones.length} usuario(s)`);
  }
}
