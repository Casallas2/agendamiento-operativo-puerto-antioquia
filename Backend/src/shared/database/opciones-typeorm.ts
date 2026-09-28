import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

/** Lector de configuración: lo implementan tanto `ConfigService` como `process.env` */
export type LectorConfiguracion = (clave: string, porDefecto?: string) => string | undefined;

/**
 * Opciones de conexión compartidas por la aplicación y por el CLI de migraciones.
 * Reason: tenerlas en un solo lugar evita que `yarn migration:run` corra contra una
 * base distinta a la que usa el servidor.
 */
export const construirOpcionesTypeOrm = (leer: LectorConfiguracion): DataSourceOptions => {
  const entorno = leer('NODE_ENV', 'development');
  const esDesarrollo = entorno === 'development';

  return {
    type: 'postgres',
    host: leer('DB_HOST', 'localhost'),
    port: Number(leer('DB_PORT', '5432')),
    username: leer('DB_USERNAME', 'postgres'),
    password: leer('DB_PASSWORD', ''),
    database: leer('DB_NAME', 'agendamiento_operativo'),
    entities: [join(__dirname, '..', '..', 'modules', '**', 'entities', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    // El esquema se gobierna siempre con migraciones, nunca con `synchronize`
    synchronize: false,
    logging: esDesarrollo ? ['error', 'warn', 'migration'] : ['error'],
    ssl: entorno === 'production' ? { rejectUnauthorized: false } : false,
    extra: { max: 20, connectionTimeoutMillis: 10_000 },
  };
};
