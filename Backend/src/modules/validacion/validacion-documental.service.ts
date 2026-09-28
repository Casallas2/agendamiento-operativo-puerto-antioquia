import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { TipoValidacion } from 'src/common/types/dominio.type';
import { BusEventosService } from 'src/modules/eventos/bus-eventos.service';
import { EventoTurno, Turno, ValidacionTurno } from 'src/modules/turnos/entities';
import { liberarCupo } from 'src/modules/turnos/franjas.helper';
import { UsersService } from 'src/modules/users/users.service';
import { AdaptadorDian } from './adaptadores/dian.adapter';
import { AdaptadorOperadorPortuario } from './adaptadores/operador-portuario.adapter';
import type { ResultadoValidacion } from './types';

/**
 * ServicioValidacionDocumental: consume el evento TurnoSolicitado y ejecuta las cinco
 * validaciones en paralelo contra los adaptadores (RF-02). El transportista no queda
 * bloqueado: el POST ya respondió 202 y el resultado llega después por el bus de eventos.
 */
@Injectable()
export class ValidacionDocumentalService {
  private readonly logger = new Logger(ValidacionDocumentalService.name);
  /** Evita que dos disparos concurrentes validen el mismo turno */
  private readonly validacionesEnCurso = new Set<string>();

  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(ValidacionTurno)
    private readonly validacionRepository: Repository<ValidacionTurno>,
    private readonly dataSource: DataSource,
    private readonly adaptadorDian: AdaptadorDian,
    private readonly adaptadorOperador: AdaptadorOperadorPortuario,
    private readonly busEventos: BusEventosService,
    private readonly usersService: UsersService,
  ) {}

  /** Punto de entrada asíncrono: nunca debe hacer fallar a quien lo dispara */
  ejecutarEnSegundoPlano(turnoId: string): void {
    void this.ejecutarValidacionPreArribo(turnoId).catch((error: Error) => {
      this.logger.error(`Falló la validación del turno ${turnoId}`, error.stack);
    });
  }

  async ejecutarValidacionPreArribo(turnoId: string): Promise<void> {
    if (this.validacionesEnCurso.has(turnoId)) {
      return;
    }

    const turno = await this.turnoRepository.findOne({
      where: { id: turnoId },
      relations: { conductor: true, vehiculo: true },
    });
    if (!turno || turno.estado !== 'PENDIENTE_VALIDACION' || !turno.conductor || !turno.vehiculo) {
      return;
    }

    this.validacionesEnCurso.add(turnoId);
    try {
      await this.validacionRepository.update({ turnoId }, { estado: 'EN_PROCESO' });

      const documentoCarga = {
        numeroManifiesto: turno.numeroManifiesto,
        numeroBl: turno.numeroBl,
      };

      const resultados = await Promise.all([
        this.adaptadorDian
          .validarDocumentoCarga(documentoCarga)
          .then((resultado) => this.registrarResultado(turnoId, 'MANIFIESTO_DIAN', resultado)),
        this.adaptadorOperador
          .validarDocumentoCarga(documentoCarga)
          .then((resultado) => this.registrarResultado(turnoId, 'BL_OPERADOR', resultado)),
        this.adaptadorOperador
          .validarConductor(turno.conductor, turno.inicio)
          .then((resultado) => this.registrarResultado(turnoId, 'LICENCIA_RUNT', resultado)),
        this.adaptadorOperador
          .validarVehiculo(turno.vehiculo, 'SOAT', turno.inicio)
          .then((resultado) => this.registrarResultado(turnoId, 'SOAT', resultado)),
        this.adaptadorOperador
          .validarVehiculo(turno.vehiculo, 'TECNOMECANICA', turno.inicio)
          .then((resultado) => this.registrarResultado(turnoId, 'TECNOMECANICA', resultado)),
      ]);

      await this.cerrarValidacion(turno, resultados);
    } finally {
      this.validacionesEnCurso.delete(turnoId);
    }
  }

  /** Persiste el resultado de una validación y avisa a la interfaz para que refresque */
  private async registrarResultado(
    turnoId: string,
    tipo: TipoValidacion,
    resultado: ResultadoValidacion,
  ): Promise<ResultadoValidacion> {
    await this.validacionRepository.update(
      { turnoId, tipo },
      { estado: resultado.aprobado ? 'APROBADA' : 'RECHAZADA', mensaje: resultado.mensaje },
    );

    await this.busEventos.publicar({
      tipo: 'ValidacionActualizada',
      titulo: 'Validación actualizada',
      descripcion: resultado.mensaje,
      severidad: resultado.aprobado ? 'EXITO' : 'ERROR',
      usuariosAfectados: [],
      turnoId,
    });

    return resultado;
  }

  /**
   * Cierra la validación: basta un rechazo para tumbar el turno y liberar el cupo.
   * La transición se hace en transacción y solo si el turno sigue en validación.
   */
  private async cerrarValidacion(turno: Turno, resultados: ResultadoValidacion[]): Promise<void> {
    const primerRechazo = resultados.find((resultado) => !resultado.aprobado);
    const ahora = new Date();

    const estadoCambiado = await this.dataSource.transaction(async (gestor) => {
      const turnoGuardado = await gestor.findOne(Turno, { where: { id: turno.id } });
      if (!turnoGuardado || turnoGuardado.estado !== 'PENDIENTE_VALIDACION') {
        return false;
      }

      if (primerRechazo) {
        turnoGuardado.estado = 'RECHAZADO';
        turnoGuardado.motivoRechazo = primerRechazo.mensaje;
        // El cupo se libera para que otro transportista pueda tomarlo
        await liberarCupo(gestor, turnoGuardado.franjaId);
      } else {
        turnoGuardado.estado = 'CONFIRMADO';
      }
      await gestor.save(turnoGuardado);

      await gestor.save(
        gestor.create(EventoTurno, {
          turnoId: turnoGuardado.id,
          tipo: primerRechazo ? 'TurnoRechazado' : 'TurnoValidado',
          descripcion: primerRechazo
            ? primerRechazo.mensaje
            : 'Documentación validada y turno confirmado',
          ocurridoEn: ahora,
        }),
      );

      return true;
    });

    if (!estadoCambiado) {
      return;
    }

    const destinatarios = await this.usersService.obtenerInteresadosEnTurno(turno);
    await this.busEventos.publicar({
      tipo: primerRechazo ? 'TurnoRechazado' : 'TurnoValidado',
      titulo: primerRechazo ? `Turno ${turno.codigo} rechazado` : `Turno ${turno.codigo} confirmado`,
      descripcion: primerRechazo
        ? `Motivo: ${primerRechazo.mensaje}. Corrige la documentación y agenda de nuevo.`
        : 'Toda la documentación fue validada. Presentarse en la ventana asignada.',
      severidad: primerRechazo ? 'ERROR' : 'EXITO',
      usuariosAfectados: destinatarios,
      turnoId: turno.id,
    });

    this.logger.log(`Turno ${turno.codigo} → ${primerRechazo ? 'RECHAZADO' : 'CONFIRMADO'}`);
  }

  /** Si el servidor se reinició a mitad de una validación, se retoma al arrancar */
  async reanudarPendientes(): Promise<void> {
    const pendientes = await this.turnoRepository.find({
      where: { estado: 'PENDIENTE_VALIDACION' },
      select: { id: true },
    });
    pendientes.forEach((turno) => this.ejecutarEnSegundoPlano(turno.id));

    if (pendientes.length > 0) {
      this.logger.log(`Reanudando ${pendientes.length} validación(es) pendiente(s)`);
    }
  }
}
