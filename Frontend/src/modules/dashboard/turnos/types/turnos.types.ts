export type EstadoTurno =
  | 'PENDIENTE_VALIDACION'
  | 'CONFIRMADO'
  | 'RECHAZADO'
  | 'EN_CAMINO'
  /** El conductor reportó una novedad: el viaje quedó interrumpido hasta que la resuelva */
  | 'CON_NOVEDAD'
  | 'EN_PUERTO'
  | 'COMPLETADO'
  | 'CANCELADO';

export type TipoOperacion = 'EXPORTACION' | 'IMPORTACION';

export type TipoValidacion =
  | 'MANIFIESTO_DIAN'
  | 'BL_OPERADOR'
  | 'LICENCIA_RUNT'
  | 'SOAT'
  | 'TECNOMECANICA'
  /** Solo para carga refrigerada de exportación (OCI-001) */
  | 'CERTIFICADO_ICA';

export type EstadoValidacion = 'PENDIENTE' | 'EN_PROCESO' | 'APROBADA' | 'RECHAZADA';

export interface Validacion {
  tipo: TipoValidacion;
  etiqueta: string;
  fuente: string;
  estado: EstadoValidacion;
  mensaje?: string;
}

export interface EventoTurno {
  tipo: string;
  descripcion: string;
  ocurridoEn: string;
}

export interface Franja {
  id: string;
  muelleId: string;
  inicio: string;
  fin: string;
  capacidad: number;
  ocupados: number;
  /** Cupos reservados para carga refrigerada (OCI-001) */
  cupoPrioritario: number;
  ocupadosRefrigerados: number;
  /** Cupos que aún puede tomar cada tipo de carga */
  disponibles: { general: number; refrigerada: number };
}

export interface Turno {
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
  cargaRefrigerada: boolean;
  numeroCertificadoIca?: string;
  estado: EstadoTurno;
  retrasoMinutos: number;
  motivoRechazo?: string;
  observaciones?: string;
  validaciones: Validacion[];
  historial: EventoTurno[];
  creadoEn: string;
}

/** Turno con los datos relacionados ya resueltos para pintar en pantalla */
export interface TurnoDetallado extends Turno {
  placa: string;
  nombreConductor: string;
  nombreMuelle: string;
  nombreEmpresa: string;
}

export interface CrearTurnoPayload {
  vehiculoId: string;
  conductorId: string;
  tipoOperacion: TipoOperacion;
  tipoCarga: string;
  numeroManifiesto: string;
  numeroBl: string;
  cargaRefrigerada: boolean;
  numeroCertificadoIca?: string;
  franjaId: string;
  observaciones?: string;
}

export interface FiltroTurnos {
  estado?: EstadoTurno | 'TODOS';
  busqueda?: string;
}
