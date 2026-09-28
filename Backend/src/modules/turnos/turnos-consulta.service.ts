import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import type { FiltroTurnosDto } from './dto';
import { Turno } from './entities';
import { detallarTurno, RELACIONES_TURNO_DETALLADO } from './turnos.mapper';
import type { TurnoDetalladoData, TurnoResponse, TurnosResponse } from './types';

/**
 * Consultas de turnos. La visibilidad se resuelve en el `WHERE`, no filtrando en memoria:
 * el operador ve todo, el transportista solo su empresa y el conductor solo lo suyo.
 */
@Injectable()
export class TurnosConsultaService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
  ) {}

  private filtroVisibilidad(usuario: UsuarioSesion): FindOptionsWhere<Turno> {
    if (usuario.rol === 'OPERADOR_PORTUARIO') {
      return {};
    }
    if (usuario.rol === 'CONDUCTOR') {
      return { conductorId: usuario.conductorId ?? '' };
    }
    return { empresaId: usuario.empresaId ?? '' };
  }

  private coincideBusqueda(turno: TurnoDetalladoData, busqueda: string): boolean {
    const textoBuscado = busqueda.trim().toLowerCase();
    if (!textoBuscado) {
      return true;
    }
    return [turno.codigo, turno.placa, turno.nombreConductor, turno.nombreMuelle, turno.nombreEmpresa]
      .some((valor) => valor.toLowerCase().includes(textoBuscado));
  }

  async obtenerTurnos(usuario: UsuarioSesion, filtro: FiltroTurnosDto = {}): Promise<TurnosResponse> {
    const condiciones: FindOptionsWhere<Turno> = this.filtroVisibilidad(usuario);
    if (filtro.estado && filtro.estado !== 'TODOS') {
      condiciones.estado = filtro.estado;
    }

    const turnos = await this.turnoRepository.find({
      where: condiciones,
      relations: RELACIONES_TURNO_DETALLADO,
      order: { inicio: 'ASC' },
    });

    const detallados = turnos
      .map(detallarTurno)
      .filter((turno) => this.coincideBusqueda(turno, filtro.busqueda ?? ''));

    return construirRespuesta(200, 'Turnos obtenidos exitosamente', detallados);
  }

  async obtenerTurno(usuario: UsuarioSesion, turnoId: string): Promise<TurnoResponse> {
    const turno = await this.buscarVisible(usuario, turnoId);
    return construirRespuesta(200, 'Turno obtenido', detallarTurno(turno));
  }

  /** Mismo mensaje para "no existe" y "no tienes acceso": no se filtra la existencia de turnos ajenos */
  async buscarVisible(usuario: UsuarioSesion, turnoId: string): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({
      where: { id: turnoId, ...this.filtroVisibilidad(usuario) },
      relations: RELACIONES_TURNO_DETALLADO,
    });

    if (!turno) {
      throw new NotFoundException('El turno no existe o no tienes acceso a él');
    }
    return turno;
  }

  /** Recarga un turno con todas sus relaciones, por ejemplo tras una mutación */
  async recargarDetallado(turnoId: string): Promise<TurnoDetalladoData> {
    const turno = await this.turnoRepository.findOneOrFail({
      where: { id: turnoId },
      relations: RELACIONES_TURNO_DETALLADO,
    });
    return detallarTurno(turno);
  }
}
