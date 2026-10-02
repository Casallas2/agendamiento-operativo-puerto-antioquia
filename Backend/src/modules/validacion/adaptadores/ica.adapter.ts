import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroExterno } from '../entities';
import { construirResultado, type DocumentoCarga, type ResultadoValidacion } from '../types';
import { simularLatencia, type ValidadorExterno } from './validador-externo.interface';

const LATENCIA_CERTIFICADO_MS = 1_800;

/** Respuesta del servicio de certificación fitosanitaria, con su vocabulario propio */
type RespuestaCertificadoIca = {
  certificate_id: string;
  phyto_status: 'ISSUED' | 'NOT_FOUND';
};

/**
 * Adaptador del servicio REST de certificación fitosanitaria de exportación del ICA (OCI-001).
 * Reason: entra como un adaptador más detrás de `ValidadorExterno`. El servicio de validación
 * no conoce el protocolo del ICA, así que agregar este sistema no cambió su lógica central
 * (RNF-09). Igual que en los otros adaptadores, el prototipo resuelve contra
 * `registros_externos` porque no puede consultar el servicio real.
 */
@Injectable()
export class AdaptadorIca implements ValidadorExterno {
  private readonly logger = new Logger(AdaptadorIca.name);

  constructor(
    @InjectRepository(RegistroExterno)
    private readonly registroRepository: Repository<RegistroExterno>,
  ) {}

  /** Simula `GET /phytosanitary/certificates/{id}` y su cuerpo JSON */
  private async consultarCertificado(numero: string): Promise<RespuestaCertificadoIca> {
    await simularLatencia(LATENCIA_CERTIFICADO_MS);
    const existe = await this.registroRepository.exists({ where: { sistema: 'ICA', numero } });
    this.logger.debug(`GET /phytosanitary/certificates/${numero}`);

    return { certificate_id: numero, phyto_status: existe ? 'ISSUED' : 'NOT_FOUND' };
  }

  async validarDocumentoCarga(documento: DocumentoCarga): Promise<ResultadoValidacion> {
    if (!documento.numeroCertificadoIca) {
      return construirResultado(false, 'Falta el certificado fitosanitario del ICA');
    }

    const respuesta = await this.consultarCertificado(documento.numeroCertificadoIca);
    return respuesta.phyto_status === 'ISSUED'
      ? construirResultado(true, 'Certificado fitosanitario expedido por el ICA')
      : construirResultado(false, 'El certificado fitosanitario no está expedido por el ICA');
  }

  async validarConductor(): Promise<ResultadoValidacion> {
    return construirResultado(true, 'El ICA no valida conductores');
  }

  async validarVehiculo(): Promise<ResultadoValidacion> {
    return construirResultado(true, 'El ICA no valida vehículos');
  }
}
