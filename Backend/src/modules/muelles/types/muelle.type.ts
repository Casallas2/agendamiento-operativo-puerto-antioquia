import type { EstadoMuelle } from 'src/common/types/dominio.type';
import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';

/** Espejo de `Muelle` en el frontend */
export type MuelleData = {
  id: string;
  nombre: string;
  tipoCarga: string;
  estado: EstadoMuelle;
  retrasoMinutos: number;
  motivoNovedad?: string;
  capacidadPorFranja: number;
};

export type MuellesResponse = RespuestaApiConDatos<MuelleData[]>;
export type MuelleResponse = RespuestaApiConDatos<MuelleData>;
/** Las acciones de novedad devuelven cuántos turnos quedaron notificados */
export type TurnosNotificadosResponse = RespuestaApiConDatos<number>;
