import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SemillaModule } from './semilla.module';
import { SemillaService } from './semilla.service';

/** Punto de entrada de `yarn seed`: carga los datos de demostración y termina */
const ejecutar = async (): Promise<void> => {
  const logger = new Logger('Semilla');
  const contexto = await NestFactory.createApplicationContext(SemillaModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    await contexto.get(SemillaService).ejecutar();
    logger.log('Listo. Usuarios de demostración disponibles para iniciar sesión.');
  } catch (error) {
    logger.error('No se pudo cargar la semilla', (error as Error)?.stack);
    process.exitCode = 1;
  } finally {
    await contexto.close();
  }
};

void ejecutar();
