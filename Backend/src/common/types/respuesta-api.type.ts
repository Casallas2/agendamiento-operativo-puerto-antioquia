/**
 * Contrato de respuesta OBLIGATORIO de toda la API: `{ status, message, data }`.
 * El frontend lo consume con la interfaz `RespuestaApi<Datos>` de `core/api/respuestaApi.ts`.
 */
export type RespuestaApi<Datos = undefined> = {
  status: number;
  message: string;
  data?: Datos;
};

/** Respuesta con datos garantizados (consultas y creaciones) */
export type RespuestaApiConDatos<Datos> = {
  status: number;
  message: string;
  data: Datos;
};

export const construirRespuesta = <Datos>(
  status: number,
  message: string,
  data: Datos,
): RespuestaApiConDatos<Datos> => ({ status, message, data });

/** Para operaciones sin cuerpo de retorno (cierres de sesión, borrados, marcados) */
export const construirRespuestaVacia = (status: number, message: string): RespuestaApi => ({
  status,
  message,
});

/** Las fechas SIEMPRE viajan como string ISO, nunca como objeto Date */
export const aIso = (fecha: Date | string): string =>
  fecha instanceof Date ? fecha.toISOString() : new Date(fecha).toISOString();
