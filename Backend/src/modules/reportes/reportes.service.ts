import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, format, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Between, Repository, type FindOptionsWhere } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { Muelle } from 'src/modules/muelles/entities';
import { ESTADOS_TURNO_ATENDIDOS } from 'src/modules/turnos/estados-turno.constants';
import { Franja, Turno } from 'src/modules/turnos/entities';
import { PuntoEspera } from './entities';
import type {
  IndicadoresOperacion, OcupacionFranja, RechazoPorMotivo, ReporteResponse,
} from './types';

/**
 * Indicadores agregados del panel y de la vista de reportes (RNF-03).
 * El transportista ve solo lo de su empresa; el operador portuario, toda la operación.
 */
@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Franja)
    private readonly franjaRepository: Repository<Franja>,
    @InjectRepository(Muelle)
    private readonly muelleRepository: Repository<Muelle>,
    @InjectRepository(PuntoEspera)
    private readonly esperaRepository: Repository<PuntoEspera>,
  ) {}

  async obtenerReporte(usuario: UsuarioSesion): Promise<ReporteResponse> {
    const hoy = new Date();
    const esOperador = usuario.rol === 'OPERADOR_PORTUARIO';
    const visibilidad: FindOptionsWhere<Turno> = esOperador
      ? {}
      : { empresaId: usuario.empresaId ?? '' };

    const [turnosVisibles, franjasHoy, muellesConNovedad, historialEspera] = await Promise.all([
      this.turnoRepository.find({ where: visibilidad, relations: { validaciones: true } }),
      this.franjaRepository.find({ where: { inicio: Between(startOfDay(hoy), endOfDay(hoy)) } }),
      this.muelleRepository.count({ where: [{ estado: 'RETRASADO' }, { estado: 'MANTENIMIENTO' }] }),
      this.esperaRepository.find({ order: { fecha: 'ASC' } }),
    ]);

    return construirRespuesta(200, 'Reporte generado', {
      indicadores: {
        ...this.calcularIndicadores(turnosVisibles, hoy, muellesConNovedad, historialEspera),
        usoCuotaPrioritaria: this.calcularUsoCuota(franjasHoy),
      },
      ocupacionPorFranja: this.agruparOcupacion(franjasHoy),
      rechazosPorMotivo: this.contarRechazos(turnosVisibles),
      historialEspera: historialEspera.map((punto) => ({
        dia: format(new Date(punto.fecha), 'd MMM', { locale: es }),
        minutos: punto.minutos,
      })),
    });
  }

  private calcularIndicadores(
    turnos: Turno[],
    hoy: Date,
    muellesConNovedad: number,
    historialEspera: PuntoEspera[],
  ): Omit<IndicadoresOperacion, 'usoCuotaPrioritaria'> {
    const turnosHoy = turnos.filter(
      (turno) => isSameDay(turno.inicio, hoy) && turno.estado !== 'CANCELADO',
    );
    const turnosValidados = turnos.filter(
      (turno) => turno.estado !== 'PENDIENTE_VALIDACION' && turno.estado !== 'CANCELADO',
    );
    const turnosRechazados = turnos.filter((turno) => turno.estado === 'RECHAZADO');

    const primeraEspera = historialEspera[0]?.minutos ?? 0;
    const ultimaEspera = historialEspera.at(-1)?.minutos ?? 0;

    return {
      turnosHoy: turnosHoy.length,
      turnosConfirmadosHoy: turnosHoy.filter((turno) =>
        ESTADOS_TURNO_ATENDIDOS.includes(turno.estado),
      ).length,
      turnosEnValidacion: turnos.filter((turno) => turno.estado === 'PENDIENTE_VALIDACION').length,
      vehiculosEnCamino: turnos.filter((turno) => turno.estado === 'EN_CAMINO').length,
      tasaRechazoDocumental: turnosValidados.length
        ? Math.round((turnosRechazados.length / turnosValidados.length) * 100)
        : 0,
      muellesConNovedad,
      esperaPromedioMinutos: ultimaEspera,
      reduccionEsperaPorcentaje: primeraEspera
        ? Math.round(((primeraEspera - ultimaEspera) / primeraEspera) * 100)
        : 0,
      turnosRefrigeradosHoy: turnosHoy.filter((turno) => turno.cargaRefrigerada).length,
    };
  }

  /** Qué parte de la cuota prioritaria de hoy ocupó la carga refrigerada (OCI-001) */
  private calcularUsoCuota(franjas: Franja[]): number {
    const cuotaTotal = franjas.reduce((suma, franja) => suma + franja.cupoPrioritario, 0);
    const cuotaUsada = franjas.reduce(
      (suma, franja) => suma + Math.min(franja.ocupadosRefrigerados, franja.cupoPrioritario),
      0,
    );
    return cuotaTotal ? Math.round((cuotaUsada / cuotaTotal) * 100) : 0;
  }

  /** Suma la ocupación de todos los muelles hora por hora */
  private agruparOcupacion(franjas: Franja[]): OcupacionFranja[] {
    const porHora = new Map<string, { ocupados: number; capacidad: number }>();

    franjas.forEach((franja) => {
      const etiquetaHora = format(franja.inicio, 'HH:mm');
      const acumulado = porHora.get(etiquetaHora) ?? { ocupados: 0, capacidad: 0 };
      porHora.set(etiquetaHora, {
        ocupados: acumulado.ocupados + franja.ocupados,
        capacidad: acumulado.capacidad + franja.capacidad,
      });
    });

    return [...porHora.entries()]
      .sort(([horaA], [horaB]) => horaA.localeCompare(horaB))
      .map(([franja, valores]) => ({ franja, ...valores }));
  }

  /** Motivos por los que se rechaza documentación, de mayor a menor frecuencia */
  private contarRechazos(turnos: Turno[]): RechazoPorMotivo[] {
    const conteo = new Map<string, number>();

    turnos.forEach((turno) => {
      (turno.validaciones ?? [])
        .filter((validacion) => validacion.estado === 'RECHAZADA')
        .forEach((validacion) => {
          conteo.set(validacion.etiqueta, (conteo.get(validacion.etiqueta) ?? 0) + 1);
        });
    });

    return [...conteo.entries()]
      .map(([motivo, cantidad]) => ({ motivo, cantidad }))
      .sort((rechazoA, rechazoB) => rechazoB.cantidad - rechazoA.cantidad);
  }
}
