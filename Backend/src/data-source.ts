import 'dotenv/config';
import { DataSource } from 'typeorm';
import { construirOpcionesTypeOrm } from './shared/database/opciones-typeorm';

/** DataSource que consume el CLI de TypeORM (`yarn migration:run`, `yarn seed`) */
export default new DataSource(
  construirOpcionesTypeOrm((clave: string, porDefecto?: string) => process.env[clave] ?? porDefecto),
);
