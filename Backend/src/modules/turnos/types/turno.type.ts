import type {
  EstadoTurno, EstadoValidacion, TipoOperacion, TipoValidacion,
} from 'src/common/types/dominio.type';
import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';

/** Espejo de `Validacion` en el frontend */
export type ValidacionData = {
  tipo: TipoValidacion;
  etiqueta: string;
  fuente: string;
  estado: EstadoValidacion;
  mensaje?: string;
};

/** Espejo de `EventoTurno` en el frontend */
export type EventoTurnoData = {
  tipo: string;
  descripcion: string;
  ocurridoEn: string;
};

/** Espejo de `Franja` en el frontend */
export type FranjaData = {
  id: string;
  muelleId: string;
  inicio: string;
  fin: string;
  capacidad: number;
  ocupados: number;
};

/** Espejo de `Turno` en el frontend */
export type TurnoData = {
  id: string;
  codigo: string;
  empresaId: string;
  vehiculoId: string;
  conductorId: string;
  muelleId: string;
  franjaId: string;
  inicio: string;
  fin: string;
  tipoOperacion: TipoOperacion;
  tipoCarga: string;
  numeroManifiesto: string;
  numeroBl: string;
  estado: EstadoTurno;
  retrasoMinutos: number;
  motivoRechazo?: string;
  observaciones?: string;
  validaciones: ValidacionData[];
  historial: EventoTurnoData[];
  creadoEn: string;
};

/** Turno con los datos relacionados ya resueltos para pintar en pantalla */
export type TurnoDetalladoData = TurnoData & {
  placa: string;
  nombreConductor: string;
  nombreMuelle: string;
  nombreEmpresa: string;
};

export type TurnosResponse = RespuestaApiConDatos<TurnoDetalladoData[]>;
export type TurnoResponse = RespuestaApiConDatos<TurnoDetalladoData>;
export type FranjasResponse = RespuestaApiConDatos<FranjaData[]>;
