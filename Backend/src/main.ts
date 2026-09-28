import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CABECERA_AREA } from './common/constants/sesion.constants';

const configurarSwagger = (aplicacion: Parameters<typeof SwaggerModule.setup>[1], prefijo: string) => {
  const documento = new DocumentBuilder()
    .setTitle('Agendamiento Operativo · Puerto Antioquia')
    .setDescription(
      'API del sistema de agendamiento de turnos de carga. Todas las respuestas siguen ' +
        'el contrato { status, message, data } y las fechas viajan como string ISO.',
    )
    .setVersion('1.0')
    .addCookieAuth('puerto-sesion-portal', { type: 'apiKey', in: 'cookie' }, 'cookie-auth')
    .build();

  SwaggerModule.setup(`${prefijo}/docs`, aplicacion, SwaggerModule.createDocument(aplicacion, documento));
};

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const aplicacion = await NestFactory.create(AppModule, { bufferLogs: false });
  const configService = aplicacion.get(ConfigService);

  const prefijo = configService.get<string>('API_PREFIX', 'api/v1');
  const puerto = Number(configService.get<string>('PORT', '4000'));
  const origen = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  aplicacion.setGlobalPrefix(prefijo);
  aplicacion.use(cookieParser());
  aplicacion.use(compression());
  // `crossOriginResourcePolicy` relajado porque el frontend vive en otro origen en desarrollo
  aplicacion.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // `credentials` es obligatorio: la sesión viaja en cookie httpOnly, no en cabecera
  aplicacion.enableCors({
    origin: origen.split(',').map((valor) => valor.trim()),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', CABECERA_AREA],
  });

  aplicacion.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  configurarSwagger(aplicacion, prefijo);

  await aplicacion.listen(puerto);
  logger.log(`API escuchando en http://localhost:${puerto}/${prefijo}`);
  logger.log(`Documentación Swagger en http://localhost:${puerto}/${prefijo}/docs`);
}

void bootstrap();
