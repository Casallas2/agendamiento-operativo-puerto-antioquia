import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroExterno } from '../entities';
import { construirResultado, type DocumentoCarga, type ResultadoValidacion } from '../types';
import { simularLatencia, type ValidadorExterno } from './validador-externo.interface';

const LATENCIA_CONSULTA_MS = 1_400;

/**
 * Adaptador del servicio web SOAP legado de la DIAN.
 * Reason: se construye y se "parsea" un sobre XML a propósito, para dejar demostrado que la
 * traducción de protocolo queda encapsulada aquí y no contamina al servicio de validación.
 */
@Injectable()
export class AdaptadorDian implements ValidadorExterno {
  private readonly logger = new Logger(AdaptadorDian.name);

  constructor(
    @InjectRepository(RegistroExterno)
    private readonly registroRepository: Repository<RegistroExterno>,
  ) {}

  private construirSobreSoap(numeroManifiesto: string): string {
    return (
      '<soap:Envelope><soap:Body><ConsultarManifiesto>' +
      `<numero>${numeroManifiesto}</numero>` +
      '</ConsultarManifiesto></soap:Body></soap:Envelope>'
    );
  }

  /** Simula el transporte SOAP: recibe un sobre XML y devuelve otro */
  private async enviarSolicitudSoap(sobreXml: string): Promise<string> {
    const numeroManifiesto = /<numero>(.*)<\/numero>/.exec(sobreXml)?.[1] ?? '';
    const existe = await this.registroRepository.exists({
      where: { sistema: 'DIAN', numero: numeroManifiesto },
    });
    const estado = existe ? 'REGISTRADO' : 'NO_ENCONTRADO';
    return `<RespuestaManifiesto><estado>${estado}</estado></RespuestaManifiesto>`;
  }

  async validarDocumentoCarga(documento: DocumentoCarga): Promise<ResultadoValidacion> {
    await simularLatencia(LATENCIA_CONSULTA_MS);

    const respuestaXml = await this.enviarSolicitudSoap(
      this.construirSobreSoap(documento.numeroManifiesto),
    );
    const estadoManifiesto = /<estado>(.*)<\/estado>/.exec(respuestaXml)?.[1];
    this.logger.debug(`Manifiesto ${documento.numeroManifiesto} → ${estadoManifiesto}`);

    return estadoManifiesto === 'REGISTRADO'
      ? construirResultado(true, 'Manifiesto registrado en la DIAN')
      : construirResultado(false, 'El manifiesto no se encuentra registrado en la DIAN');
  }

  async validarConductor(): Promise<ResultadoValidacion> {
    return construirResultado(true, 'La DIAN no valida conductores');
  }

  async validarVehiculo(): Promise<ResultadoValidacion> {
    return construirResultado(true, 'La DIAN no valida vehículos');
  }
}
