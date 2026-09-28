import {
  ConflictException, ForbiddenException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { BusEventosService } from 'src/modules/eventos/bus-eventos.service';
import { Conductor, Vehiculo } from 'src/modules/flota/entities';
import { mapearConductor, mapearVehiculo } from 'src/modules/flota/flota.mapper';
import { Muelle } from 'src/modules/muelles/entities';
import { mapearMuelle } from 'src/modules/muelles/muelles.mapper';
import { EventoTurno, Turno } from 'src/modules/turnos/entities';
import {
  ESTADOS_INTERRUMPIBLES,
  ESTADOS_QUE_PERMITEN_VIAJAR,
  ESTADOS_VISIBLES_CABINA,
} from 'src/modules/turnos/estados-turno.constants';
import { detallarTurno, RELACIONES_TURNO_DETALLADO } from 'src/modules/turnos/turnos.mapper';
import type { TurnoDetalladoData, TurnoResponse } from 'src/modules/turnos/types';
import { UsersService } from 'src/modules/users/users.service';
import type { ReportarNovedadDto } from './dto';
import type { ResumenConductorResponse } from './types';

@Injectable()
export class ConductorService {
  private readonly logger = new Logger(ConductorService.name);

  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(EventoTurno)
    private readonly eventoRepository: Repository<EventoTurno>,
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(Muelle)
    private readonly muelleRepository: Repository<Muelle>,
    private readonly busEventos: BusEventosService,
    private readonly usersService: UsersService,
  ) {}

  private exigirConductor(usuario: UsuarioSesion): string {
    if (usuario.rol !== 'CONDUCTOR' || !usuario.conductorId) {
      throw new ForbiddenException('Esta vista es exclusiva para conductores');
    }
    return usuario.conductorId;
  }

  /**
   * Resumen de cabina: el próximo turno activo, el vehículo asignado y el muelle destino.
   * Se descartan los turnos cuya ventana (más el retraso declarado) ya pasó.
   */
  async obtenerResumen(usuario: UsuarioSesion): Promise<ResumenConductorResponse> {
    const conductorId = this.exigirConductor(usuario);

    const conductor = await this.conductorRepository.findOne({ where: { id: conductorId } });
    if (!conductor) {
      throw new NotFoundException('No encontramos tu ficha de conductor');
    }

    const turnos = await this.turnoRepository.find({
      where: { conductorId, estado: In(ESTADOS_VISIBLES_CABINA) },
      relations: RELACIONES_TURNO_DETALLADO,
      order: { inicio: 'ASC' },
    });

    const ahora = Date.now();
    const turnosActivos: TurnoDetalladoData[] = turnos
      .filter((turno) => turno.fin.getTime() + turno.retrasoMinutos * 60_000 >= ahora)
      .map(detallarTurno);

    const turnoActual = turnosActivos[0] ?? null;
    const vehiculo = turnoActual
      ? await this.vehiculoRepository.findOne({ where: { id: turnoActual.vehiculoId } })
      : null;
    const muelle = turnoActual
      ? await this.muelleRepository.findOne({ where: { id: turnoActual.muelleId } })
      : null;

    return construirRespuesta(200, 'Resumen obtenido', {
      conductor: mapearConductor(conductor),
      vehiculo: vehiculo ? mapearVehiculo(vehiculo) : null,
      muelle: muelle ? mapearMuelle(muelle) : null,
      turnoActual,
      proximosTurnos: turnosActivos.slice(1),
    });
  }

  /** Busca un turno que pertenezca al conductor autenticado */
  private async buscarTurnoPropio(conductorId: string, turnoId: string): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({
      where: { id: turnoId, conductorId },
      relations: RELACIONES_TURNO_DETALLADO,
    });
    if (!turno) {
      throw new NotFoundException('No encontramos tu turno');
    }
    return turno;
  }

  /**
   * El conductor avisa que sale hacia el puerto (evento ConductorEnCamino).
   * También sirve para retomar el viaje tras una novedad: es el mismo gesto, «voy en camino».
   */
  async marcarEnCamino(usuario: UsuarioSesion, turnoId: string): Promise<TurnoResponse> {
    const conductorId = this.exigirConductor(usuario);
    const turno = await this.buscarTurnoPropio(conductorId, turnoId);

    if (!ESTADOS_QUE_PERMITEN_VIAJAR.includes(turno.estado)) {
      throw new ConflictException('Solo puedes iniciar viaje con un turno confirmado');
    }
    const retomaTrasNovedad = turno.estado === 'CON_NOVEDAD';

    turno.estado = 'EN_CAMINO';
    await this.turnoRepository.save(turno);
    await this.registrarEvento(
      turno.id,
      'ConductorEnCamino',
      retomaTrasNovedad
        ? `${usuario.nombre} retomó el viaje tras la novedad`
        : `${usuario.nombre} inició el viaje al puerto`,
    );

    const detallado = detallarTurno(turno);
    const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno);

    await this.busEventos.publicar({
      tipo: 'ConductorEnCamino',
      titulo: retomaTrasNovedad ? `${detallado.placa} retomó el viaje` : `${detallado.placa} en camino`,
      descripcion: retomaTrasNovedad
        ? `${usuario.nombre} resolvió la novedad y sigue hacia el ${detallado.nombreMuelle} ` +
          `para el turno ${detallado.codigo}.`
        : `${usuario.nombre} se dirige al puerto para el turno ${detallado.codigo} ` +
          `(${detallado.nombreMuelle}).`,
      severidad: retomaTrasNovedad ? 'EXITO' : 'INFO',
      usuariosAfectados: destinatarios.filter((usuarioId) => usuarioId !== usuario.id),
      turnoId: turno.id,
    });

    this.logger.log(`Turno ${detallado.codigo}: ${retomaTrasNovedad ? 'viaje retomado' : 'conductor en camino'}`);
    return construirRespuesta(
      200,
      retomaTrasNovedad ? 'Viaje retomado' : 'Viaje iniciado',
      await this.recargar(turno.id),
    );
  }

  /**
   * Novedad en ruta: el turno pasa a CON_NOVEDAD porque el vehículo dejó de avanzar.
   * Reason: si el conductor está varado o en un trancón ya no está «en camino», y el puerto
   * necesita verlo para saber que esa ventana peligra. El propio conductor lo retoma después.
   */
  async reportarNovedad(
    usuario: UsuarioSesion,
    turnoId: string,
    payload: ReportarNovedadDto,
  ): Promise<TurnoResponse> {
    const conductorId = this.exigirConductor(usuario);
    const turno = await this.buscarTurnoPropio(conductorId, turnoId);

    const interrumpeElViaje = ESTADOS_INTERRUMPIBLES.includes(turno.estado);
    if (interrumpeElViaje) {
      turno.estado = 'CON_NOVEDAD';
      await this.turnoRepository.save(turno);
    }

    await this.registrarEvento(
      turno.id,
      'NovedadReportada',
      `Novedad del conductor: ${payload.novedad}`,
    );

    const detallado = detallarTurno(turno);
    const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno);

    await this.busEventos.publicar({
      tipo: 'NovedadReportada',
      titulo: `Novedad en ruta · ${detallado.placa}`,
      descripcion: `${usuario.nombre} reportó: ${payload.novedad} (turno ${detallado.codigo}).`,
      severidad: 'ALERTA',
      usuariosAfectados: destinatarios.filter((usuarioId) => usuarioId !== usuario.id),
      turnoId: turno.id,
    });

    this.logger.log(`Turno ${detallado.codigo}: novedad reportada (${payload.novedad})`);
    return construirRespuesta(200, 'Novedad reportada', await this.recargar(turno.id));
  }

  private async registrarEvento(turnoId: string, tipo: string, descripcion: string): Promise<void> {
    await this.eventoRepository.save(
      this.eventoRepository.create({ turnoId, tipo, descripcion, ocurridoEn: new Date() }),
    );
  }

  private async recargar(turnoId: string): Promise<TurnoDetalladoData> {
    const turno = await this.turnoRepository.findOneOrFail({
      where: { id: turnoId },
      relations: RELACIONES_TURNO_DETALLADO,
    });
    return detallarTurno(turno);
  }
}
