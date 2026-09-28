import { GoneException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { DesafioMfa } from './entities';

/**
 * Gestión del segundo factor (RNF-02). En producción el código se enviaría por SMS;
 * en el prototipo se compara contra un código fijo configurado por variable de entorno.
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly codigoDemo: string;
  private readonly maximoIntentos: number;
  private readonly minutosVigencia: number;

  constructor(
    @InjectRepository(DesafioMfa)
    private readonly desafioRepository: Repository<DesafioMfa>,
    configService: ConfigService,
  ) {
    this.codigoDemo = configService.get<string>('MFA_CODIGO_DEMO', '246810');
    this.maximoIntentos = Number(configService.get<string>('MFA_MAXIMO_INTENTOS', '3'));
    this.minutosVigencia = Number(configService.get<string>('MFA_MINUTOS_VIGENCIA', '5'));
  }

  /** Enmascara el teléfono para confirmarle al usuario a dónde llegó el código */
  static enmascararTelefono(telefono: string): string {
    return `${telefono.slice(0, 4)} *** *** ${telefono.slice(-4)}`;
  }

  /** Emite un desafío nuevo y descarta cualquier otro pendiente del mismo usuario */
  async emitirDesafio(usuarioId: string): Promise<DesafioMfa> {
    await this.desafioRepository.delete({ usuarioId });

    const desafio = this.desafioRepository.create({
      usuarioId,
      intentos: 0,
      expiraEn: new Date(Date.now() + this.minutosVigencia * 60_000),
    });
    const guardado = await this.desafioRepository.save(desafio);

    // Nunca se registra el código en los logs, ni siquiera en el prototipo
    this.logger.log(`Desafío MFA emitido para el usuario ${usuarioId}`);
    return guardado;
  }

  /**
   * Verifica el código y devuelve el identificador del usuario dueño del desafío.
   * Reason: el conteo de intentos se persiste ANTES de lanzar el error para que
   * un reintento no reinicie el contador.
   */
  async verificarDesafio(desafioId: string, codigo: string): Promise<string> {
    await this.limpiarExpirados();

    const desafio = await this.desafioRepository.findOne({ where: { id: desafioId } });
    if (!desafio) {
      throw new GoneException('El código expiró. Vuelve a ingresar tus credenciales.');
    }
    if (desafio.expiraEn.getTime() < Date.now()) {
      await this.desafioRepository.delete({ id: desafio.id });
      throw new GoneException('El código expiró. Vuelve a ingresar tus credenciales.');
    }

    if (codigo !== this.codigoDemo) {
      desafio.intentos += 1;
      const intentosRestantes = this.maximoIntentos - desafio.intentos;

      if (intentosRestantes <= 0) {
        await this.desafioRepository.delete({ id: desafio.id });
        throw new UnauthorizedException(
          'Superaste los intentos permitidos. Ingresa de nuevo tus credenciales.',
        );
      }

      await this.desafioRepository.save(desafio);
      throw new UnauthorizedException(`Código incorrecto. Te quedan ${intentosRestantes} intento(s).`);
    }

    await this.desafioRepository.delete({ id: desafio.id });
    return desafio.usuarioId;
  }

  private async limpiarExpirados(): Promise<void> {
    await this.desafioRepository.delete({ expiraEn: LessThan(new Date()) });
  }
}
