import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInCalendarDays } from 'date-fns';
import { Repository } from 'typeorm';
import type { Conductor, Vehiculo } from 'src/modules/flota/entities';
import { RegistroExterno } from '../entities';
import {
  construirResultado,
  type DocumentoCarga,
  type DocumentoVehiculo,
  type ResultadoValidacion,
} from '../types';
import { simularLatencia, type ValidadorExterno } from './validador-externo.interface';

const LATENCIA_BL_MS = 900;
const LATENCIA_LICENCIA_MS = 1_700;
const LATENCIA_SOAT_MS = 2_100;
const LATENCIA_TECNOMECANICA_MS = 2_500;

/** Describe la vigencia de un documento respecto a la fecha del turno */
const describirVigencia = (
  vencimiento: Date | string,
  fechaTurno: Date,
  nombreDocumento: string,
): ResultadoValidacion => {
  const diasRestantes = differenceInCalendarDays(new Date(vencimiento), fechaTurno);
  if (diasRestantes < 0) {
    return construirResultado(false, `${nombreDocumento} vencido para la fecha del turno`);
  }
  return construirResultado(true, `${nombreDocumento} vigente (${diasRestantes} días de margen)`);
};

/**
 * Adaptador del API REST/JSON del operador portuario, que a su vez consulta el RUNT.
 * Reason: el cuerpo de la respuesta usa nombres de campo ajenos al dominio (`bl_status`,
 * `expiry`, `runt`) justamente para mostrar que la traducción ocurre dentro del adaptador.
 */
@Injectable()
export class AdaptadorOperadorPortuario implements ValidadorExterno {
  private readonly logger = new Logger(AdaptadorOperadorPortuario.name);

  constructor(
    @InjectRepository(RegistroExterno)
    private readonly registroRepository: Repository<RegistroExterno>,
  ) {}

  /** Simula el transporte HTTP: serializa y deserializa el cuerpo como haría un cliente REST */
  private async consultarRecurso<Respuesta>(
    recurso: string,
    respuesta: Respuesta,
    latencia: number,
  ): Promise<{ recurso: string; cuerpo: Respuesta }> {
    await simularLatencia(latencia);
    this.logger.debug(`GET ${recurso}`);
    return JSON.parse(JSON.stringify({ recurso, cuerpo: respuesta })) as {
      recurso: string;
      cuerpo: Respuesta;
    };
  }

  async validarDocumentoCarga(documento: DocumentoCarga): Promise<ResultadoValidacion> {
    const existe = await this.registroRepository.exists({
      where: { sistema: 'OPERADOR_PORTUARIO', numero: documento.numeroBl },
    });
    const { cuerpo } = await this.consultarRecurso(
      '/bl',
      { bl_status: existe ? 'OK' : 'UNKNOWN' },
      LATENCIA_BL_MS,
    );

    return cuerpo.bl_status === 'OK'
      ? construirResultado(true, 'BL registrado por la naviera')
      : construirResultado(false, 'El BL no está registrado en el operador portuario');
  }

  async validarConductor(conductor: Conductor, fechaTurno: Date): Promise<ResultadoValidacion> {
    const { cuerpo } = await this.consultarRecurso(
      '/runt/licencias',
      { expiry: conductor.vencimientoLicencia },
      LATENCIA_LICENCIA_MS,
    );
    return describirVigencia(cuerpo.expiry, fechaTurno, 'Licencia de conducción');
  }

  async validarVehiculo(
    vehiculo: Vehiculo,
    documento: DocumentoVehiculo,
    fechaTurno: Date,
  ): Promise<ResultadoValidacion> {
    const esSoat = documento === 'SOAT';
    const vencimiento = esSoat ? vehiculo.vencimientoSoat : vehiculo.vencimientoTecnomecanica;

    const { cuerpo } = await this.consultarRecurso(
      '/runt/vehiculos',
      { expiry: vencimiento, runt: vehiculo.estadoRunt },
      esSoat ? LATENCIA_SOAT_MS : LATENCIA_TECNOMECANICA_MS,
    );

    if (cuerpo.runt !== 'ACTIVO') {
      return construirResultado(false, 'Vehículo con registro RUNT suspendido');
    }
    return describirVigencia(
      cuerpo.expiry,
      fechaTurno,
      esSoat ? 'SOAT' : 'Revisión técnico-mecánica',
    );
  }
}
