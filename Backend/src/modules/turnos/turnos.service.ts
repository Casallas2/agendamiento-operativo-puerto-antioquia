import {
  ConflictException, ForbiddenException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';

import { DataSource, In, Not, type EntityManager } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { BusEventosService } from 'src/modules/eventos/bus-eventos.service';
import { Conductor, Vehiculo } from 'src/modules/flota/entities';
import { UsersService } from 'src/modules/users/users.service';
import { CATALOGO_VALIDACIONES } from 'src/modules/validacion/catalogo-validaciones';
import { ValidacionDocumentalService } from 'src/modules/validacion/validacion-documental.service';
import { ETIQUETAS_ESTADO_TURNO } from './estados-turno.constants';
import type { CrearTurnoDto } from './dto';
import { EventoTurno, Franja, Turno, ValidacionTurno } from './entities';
import { liberarCupo, tomarCupo } from './franjas.helper';
import { TurnosConsultaService } from './turnos-consulta.service';
import type { TurnoResponse } from './types';

const ESTADOS_CANCELABLES = ['PENDIENTE_VALIDACION', 'CONFIRMADO', 'CON_NOVEDAD'];
const ESTADOS_QUE_OCUPAN_CUPO = [
  'PENDIENTE_VALIDACION', 'CONFIRMADO', 'EN_CAMINO', 'CON_NOVEDAD', 'EN_PUERTO', 'COMPLETADO',
];

@Injectable()
export class TurnosService {
  private readonly logger = new Logger(TurnosService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly consultaService: TurnosConsultaService,
    private readonly busEventos: BusEventosService,
    private readonly usersService: UsersService,
    private readonly validacionService: ValidacionDocumentalService,
  ) {}

  /**
   * Reserva del cupo (RF-01). Responde 202: el cupo queda apartado de inmediato y la
   * validación documental sigue de forma asíncrona tras el evento TurnoSolicitado.
   */
  async crearTurno(usuario: UsuarioSesion, payload: CrearTurnoDto): Promise<TurnoResponse> {
    if (usuario.rol !== 'TRANSPORTISTA' || !usuario.empresaId) {
      throw new ForbiddenException('Solo los transportistas pueden reservar turnos');
    }
    const empresaId = usuario.empresaId;

    const turnoId = await this.dataSource.transaction(async (gestor) => {
      const franja = await gestor.findOne(Franja, {
        where: { id: payload.franjaId },
        relations: { muelle: true },
      });
      if (!franja?.muelle) {
        throw new NotFoundException('La franja seleccionada ya no existe');
      }
      if (franja.muelle.estado === 'MANTENIMIENTO') {
        throw new ConflictException(`${franja.muelle.nombre} está en mantenimiento y no recibe turnos`);
      }

      await this.verificarFlotaPropia(gestor, payload, empresaId);
      await this.verificarVehiculoLibre(gestor, payload.vehiculoId, franja.id);

      // La base de datos arbitra la carrera por el último cupo
      if (!(await tomarCupo(gestor, franja.id))) {
        throw new ConflictException('Otro transportista tomó el último cupo de esta franja. Elige otra.');
      }

      return this.persistirTurno(gestor, payload, empresaId, franja);
    });

    const turno = await this.consultaService.recargarDetallado(turnoId);

    const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno);
    await this.busEventos.publicar({
      tipo: 'TurnoSolicitado',
      titulo: `Nuevo turno ${turno.codigo}`,
      descripcion: 'Se reservó un cupo y la documentación está en validación.',
      severidad: 'INFO',
      usuariosAfectados: destinatarios.filter((usuarioId) => usuarioId !== usuario.id),
      turnoId: turno.id,
    });

    // No se espera el resultado: el transportista ya recibió su 202
    this.validacionService.ejecutarEnSegundoPlano(turno.id);
    this.logger.log(`Turno ${turno.codigo} solicitado por ${usuario.correo}`);

    return construirRespuesta(202, 'Solicitud de turno recibida', turno);
  }

  /** El vehículo y el conductor tienen que pertenecer a la empresa que reserva */
  private async verificarFlotaPropia(
    gestor: EntityManager,
    payload: CrearTurnoDto,
    empresaId: string,
  ): Promise<void> {
    const vehiculo = await gestor.findOne(Vehiculo, { where: { id: payload.vehiculoId, empresaId } });
    if (!vehiculo) {
      throw new ForbiddenException('El vehículo no pertenece a tu empresa');
    }
    const conductor = await gestor.findOne(Conductor, { where: { id: payload.conductorId, empresaId } });
    if (!conductor) {
      throw new ForbiddenException('El conductor no pertenece a tu empresa');
    }
  }

  private async verificarVehiculoLibre(
    gestor: EntityManager,
    vehiculoId: string,
    franjaId: string,
  ): Promise<void> {
    const ocupado = await gestor.exists(Turno, {
      where: {
        vehiculoId,
        franjaId,
        estado: Not(In(['CANCELADO', 'RECHAZADO'])),
      },
    });
    if (ocupado) {
      throw new ConflictException('Este vehículo ya tiene un turno en la misma franja');
    }
  }

  /** Crea el turno con sus cinco validaciones pendientes y el primer evento del historial */
  private async persistirTurno(
    gestor: EntityManager,
    payload: CrearTurnoDto,
    empresaId: string,
    franja: Franja,
  ): Promise<string> {
    const [{ nextval }] = await gestor.query<[{ nextval: string }]>(
      "SELECT nextval('turnos_codigo_seq')",
    );
    const ahora = new Date();

    const turno = gestor.create(Turno, {
      codigo: `TRN-${nextval}`,
      empresaId,
      vehiculoId: payload.vehiculoId,
      conductorId: payload.conductorId,
      muelleId: franja.muelleId,
      franjaId: franja.id,
      inicio: franja.inicio,
      fin: franja.fin,
      tipoOperacion: payload.tipoOperacion,
      tipoCarga: payload.tipoCarga,
      numeroManifiesto: payload.numeroManifiesto,
      numeroBl: payload.numeroBl,
      estado: 'PENDIENTE_VALIDACION',
      retrasoMinutos: 0,
      observaciones: payload.observaciones || null,
    });
    const guardado = await gestor.save(turno);

    await gestor.save(
      CATALOGO_VALIDACIONES.map((definicion, orden) =>
        gestor.create(ValidacionTurno, {
          turnoId: guardado.id,
          tipo: definicion.tipo,
          etiqueta: definicion.etiqueta,
          fuente: definicion.fuente,
          estado: 'PENDIENTE',
          orden,
        }),
      ),
    );

    await gestor.save(
      gestor.create(EventoTurno, {
        turnoId: guardado.id,
        tipo: 'TurnoSolicitado',
        descripcion: 'Solicitud de turno recibida',
        ocurridoEn: ahora,
      }),
    );

    return guardado.id;
  }

  /** Cancela el turno y libera el cupo para que otro transportista pueda tomarlo */
  async cancelarTurno(usuario: UsuarioSesion, turnoId: string): Promise<TurnoResponse> {
    if (usuario.rol === 'CONDUCTOR') {
      throw new ForbiddenException('No tienes permiso para cancelar este turno');
    }
    const turnoVisible = await this.consultaService.buscarVisible(usuario, turnoId);

    await this.dataSource.transaction(async (gestor) => {
      const turno = await gestor.findOne(Turno, { where: { id: turnoVisible.id } });
      if (!turno) {
        throw new NotFoundException('El turno no existe o no tienes acceso a él');
      }
      if (!ESTADOS_CANCELABLES.includes(turno.estado)) {
        throw new ConflictException(
          `No se puede cancelar un turno en estado "${ETIQUETAS_ESTADO_TURNO[turno.estado]}"`,
        );
      }

      turno.estado = 'CANCELADO';
      await gestor.save(turno);

      await gestor.save(
        gestor.create(EventoTurno, {
          turnoId: turno.id,
          tipo: 'TurnoCancelado',
          descripcion: `Cancelado por ${usuario.nombre}`,
          ocurridoEn: new Date(),
        }),
      );

      if (ESTADOS_QUE_OCUPAN_CUPO.includes(turnoVisible.estado)) {
        await liberarCupo(gestor, turno.franjaId);
      }
    });

    const turno = await this.consultaService.recargarDetallado(turnoId);

    const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno);
    await this.busEventos.publicar({
      tipo: 'TurnoCancelado',
      titulo: `Turno ${turno.codigo} cancelado`,
      descripcion: 'El cupo fue liberado. No es necesario presentarse en el puerto.',
      severidad: 'ALERTA',
      usuariosAfectados: destinatarios.filter((usuarioId) => usuarioId !== usuario.id),
      turnoId: turno.id,
    });

    this.logger.log(`Turno ${turno.codigo} cancelado por ${usuario.correo}`);
    return construirRespuesta(200, 'Turno cancelado exitosamente', turno);
  }

}
