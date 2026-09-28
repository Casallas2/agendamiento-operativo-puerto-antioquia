import { SetMetadata } from '@nestjs/common';

export const CLAVE_RUTA_PUBLICA = 'esRutaPublica';

/** Marca un endpoint como accesible sin JWT (login, verificación MFA, salud) */
export const Publico = () => SetMetadata(CLAVE_RUTA_PUBLICA, true);
