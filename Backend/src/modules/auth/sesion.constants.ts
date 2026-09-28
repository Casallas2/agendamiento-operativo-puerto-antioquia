import type { ConfigService } from '@nestjs/config';

const SEGUNDOS_POR_DEFECTO = 8 * 60 * 60;

/**
 * Duración de la sesión en segundos. La usan el JWT y el `maxAge` de la cookie,
 * para que el token y la cookie caduquen a la vez.
 */
export const obtenerSegundosSesion = (configService: ConfigService): number => {
  const configurado = Number(configService.get<string>('JWT_EXPIRES_SECONDS'));
  return Number.isFinite(configurado) && configurado > 0 ? configurado : SEGUNDOS_POR_DEFECTO;
};
