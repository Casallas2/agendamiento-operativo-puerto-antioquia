import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThanOrEqual, MoreThanOrEqual, Repository, type EntityManager } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import { BusEventosService } from 'src/modules/eventos/bus-eventos.service';
import { calcularRetrasoAplicable } from 'src/modules/turnos/cupo-prioritario';
import { EventoTurno, Turno } from 'src/modules/turnos/entities';
import { UsersService } from 'src/modules/users/users.service';
import type { DeclararRetrasoDto } from './dto';
import { Muelle } from './entities';
import { mapearMuelle } from './muelles.mapper';
import type { MuelleResponse, MuellesResponse, TurnosNotificadosResponse } from './types';

const HORAS_VENTANA_AFECTADA = 12;
// Un turno con novedad sigue vigente: también debe enterarse del retraso del muelle
const ESTADOS_AFECTABLES = ['CONFIRMADO', 'EN_CAMINO', 'CON_NOVEDAD', 'PENDIENTE_VALIDACION'] as const;

/**
 * GestorMuelles: sujeto que publica las novedades de operación. Los notificadores
 * registrados en el bus deciden por qué canal llega cada aviso (patrón Observer).
 */
@Injectable()
export class MuellesService {
  private readonly logger = new Logger(MuellesService.name);

  constructor(
    @InjectRepository(Muelle)
    private readonly muelleRepository: Repository<Muelle>,
    private readonly dataSource: DataSource,
    private readonly busEventos: BusEventosService,
    private readonly usersService: UsersService,
  ) {}

  async obtenerMuelles(): Promise<MuellesResponse> {
    const muelles = await this.muelleRepository.find({ order: { nombre: 'ASC' } });
    return construirRespuesta(200, 'Muelles obtenidos', muelles.map(mapearMuelle));
  }

  /** Turnos activos del muelle dentro de las próximas horas: son los que reciben la notificación */
  private async obtenerTurnosAfectados(gestor: EntityManager, muelleId: string): Promise<Turno[]> {
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + HORAS_VENTANA_AFECTADA * 60 * 60 * 1000);

    return gestor.find(Turno, {
      where: {
        muelleId,
        estado: In([...ESTADOS_AFECTABLES]),
        fin: MoreThanOrEqual(ahora),
        inicio: LessThanOrEqual(limite),
      },
    });
  }

  private async registrarEnHistorial(
    gestor: EntityManager,
    turnos: Turno[],
    tipo: string,
    descripcion: string,
  ): Promise<void> {
    const eventos = turnos.map((turno) =>
      gestor.create(EventoTurno, { turnoId: turno.id, tipo, descripcion, ocurridoEn: new Date() }),
    );
    await gestor.save(eventos);
  }

  /**
   * Evento MuelleRetrasado: desplaza la ventana de los turnos próximos y avisa a cada afectado.
   * OCI-001: la carga refrigerada se atiende primero, así que su desplazamiento tiene tope.
   */
  async declararRetraso(muelleId: string, payload: DeclararRetrasoDto): Promise<TurnosNotificadosResponse> {
    const { muelle, turnosAfectados } = await this.dataSource.transaction(async (gestor) => {
      const muelleGuardado = await gestor.findOne(Muelle, { where: { id: muelleId } });
      if (!muelleGuardado) {
        throw new NotFoundException('El muelle no existe');
      }

      muelleGuardado.estado = 'RETRASADO';
      muelleGuardado.retrasoMinutos = payload.minutos;
      muelleGuardado.motivoNovedad = payload.motivo;
      await gestor.save(muelleGuardado);

      const afectados = await this.obtenerTurnosAfectados(gestor, muelleId);
      for (const cargaRefrigerada of [false, true]) {
        const grupo = afectados.filter((turno) => turno.cargaRefrigerada === cargaRefrigerada);
        if (grupo.length === 0) {
          continue;
        }
        const minutos = calcularRetrasoAplicable(payload.minutos, cargaRefrigerada);
        await gestor.update(Turno, { id: In(grupo.map((turno) => turno.id)) }, { retrasoMinutos: minutos });
        grupo.forEach((turno) => {
          turno.retrasoMinutos = minutos;
        });
        await this.registrarEnHistorial(
          gestor,
          grupo,
          'MuelleRetrasado',
          cargaRefrigerada
            ? `Ventana desplazada ${minutos} min (prioridad por cadena de frío): ${payload.motivo}`
            : `Ventana desplazada ${minutos} min: ${payload.motivo}`,
        );
      }

      return { muelle: muelleGuardado, turnosAfectados: afectados };
    });

    await this.publicarRetraso(muelle, turnosAfectados, payload);
    this.logger.log(`Retraso de ${payload.minutos} min en ${muelle.nombre}: ${turnosAfectados.length} turno(s)`);

    return construirRespuesta(200, 'Retraso declarado y notificado', turnosAfectados.length);
  }

  private async publicarRetraso(
    muelle: Muelle,
    turnos: Turno[],
    payload: DeclararRetrasoDto,
  ): Promise<void> {
    if (turnos.length === 0) {
      await this.busEventos.publicar({
        tipo: 'MuelleRetrasado',
        titulo: `Retraso en ${muelle.nombre}`,
        descripcion: `Se declaró un retraso de ${payload.minutos} minutos. No había turnos en las próximas horas.`,
        severidad: 'ALERTA',
        usuariosAfectados: [],
        muelleId: muelle.id,
      });
      return;
    }

    for (const turno of turnos) {
      // El operador no se notifica a sí mismo: él fue quien declaró la novedad
      const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno, false);
      await this.busEventos.publicar({
        tipo: 'MuelleRetrasado',
        titulo: `Retraso de ${turno.retrasoMinutos} min en ${muelle.nombre}`,
        descripcion:
          `Tu turno ${turno.codigo} se desplaza ${turno.retrasoMinutos} minutos. ` +
          (turno.cargaRefrigerada ? 'Tu carga refrigerada tiene prioridad de atención. ' : '') +
          `Motivo: ${payload.motivo}. No te acerques antes de la nueva hora.`,
        severidad: 'ALERTA',
        usuariosAfectados: destinatarios,
        turnoId: turno.id,
        muelleId: muelle.id,
      });
    }
  }

  async restablecerOperacion(muelleId: string): Promise<TurnosNotificadosResponse> {
    const { muelle, turnosAfectados } = await this.dataSource.transaction(async (gestor) => {
      const muelleGuardado = await gestor.findOne(Muelle, { where: { id: muelleId } });
      if (!muelleGuardado) {
        throw new NotFoundException('El muelle no existe');
      }

      muelleGuardado.estado = 'OPERATIVO';
      muelleGuardado.retrasoMinutos = 0;
      muelleGuardado.motivoNovedad = null;
      await gestor.save(muelleGuardado);

      const afectados = (await this.obtenerTurnosAfectados(gestor, muelleId)).filter(
        (turno) => turno.retrasoMinutos > 0,
      );
      if (afectados.length > 0) {
        await gestor.update(Turno, { id: In(afectados.map((turno) => turno.id)) }, { retrasoMinutos: 0 });
        await this.registrarEnHistorial(
          gestor,
          afectados,
          'MuelleRestablecido',
          'El muelle volvió a operar con normalidad',
        );
      }

      return { muelle: muelleGuardado, turnosAfectados: afectados };
    });

    for (const turno of turnosAfectados) {
      const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno, false);
      await this.busEventos.publicar({
        tipo: 'MuelleRestablecido',
        titulo: `${muelle.nombre} operando con normalidad`,
        descripcion: `Tu turno ${turno.codigo} vuelve a su horario original.`,
        severidad: 'EXITO',
        usuariosAfectados: destinatarios,
        turnoId: turno.id,
        muelleId: muelle.id,
      });
    }

    return construirRespuesta(200, 'Operación restablecida', turnosAfectados.length);
  }

  /** Alterna el muelle entre mantenimiento y operación; en mantenimiento no acepta reservas */
  async alternarMantenimiento(muelleId: string): Promise<MuelleResponse> {
    const muelle = await this.muelleRepository.findOne({ where: { id: muelleId } });
    if (!muelle) {
      throw new NotFoundException('El muelle no existe');
    }

    const entraMantenimiento = muelle.estado !== 'MANTENIMIENTO';
    muelle.estado = entraMantenimiento ? 'MANTENIMIENTO' : 'OPERATIVO';
    muelle.retrasoMinutos = 0;
    muelle.motivoNovedad = entraMantenimiento ? 'Mantenimiento programado' : null;
    await this.muelleRepository.save(muelle);

    await this.busEventos.publicar({
      tipo: 'MuelleEnMantenimiento',
      titulo: entraMantenimiento ? `${muelle.nombre} en mantenimiento` : `${muelle.nombre} habilitado`,
      descripcion: entraMantenimiento
        ? 'No se aceptan nuevas reservas en este muelle.'
        : 'El muelle vuelve a aceptar reservas.',
      severidad: entraMantenimiento ? 'ALERTA' : 'EXITO',
      usuariosAfectados: [],
      muelleId: muelle.id,
    });

    return construirRespuesta(200, 'Estado del muelle actualizado', mapearMuelle(muelle));
  }

  /** Usado por el módulo de turnos para validar el muelle antes de reservar */
  async buscarPorId(muelleId: string): Promise<Muelle | null> {
    return this.muelleRepository.findOne({ where: { id: muelleId } });
  }

  /** Muelles que no están operando con normalidad; alimenta el indicador del panel */
  async contarConNovedad(): Promise<number> {
    return this.muelleRepository.count({ where: [{ estado: 'RETRASADO' }, { estado: 'MANTENIMIENTO' }] });
  }
}
