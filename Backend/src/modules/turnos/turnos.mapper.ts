import { aIso } from 'src/common/types/respuesta-api.type';
import { calcularDisponibilidad } from './cupo-prioritario';
import { CATALOGO_VALIDACIONES } from 'src/modules/validacion/catalogo-validaciones';
import type { EventoTurno, Franja, Turno, ValidacionTurno } from './entities';
import type {
  EventoTurnoData, FranjaData, TurnoData, TurnoDetalladoData, ValidacionData,
} from './types';

/** Orden en que se muestran las validaciones, igual al del catálogo */
const ORDEN_VALIDACION = new Map(
  CATALOGO_VALIDACIONES.map((definicion, indice) => [definicion.tipo, indice]),
);

export const mapearValidacion = (validacion: ValidacionTurno): ValidacionData => ({
  tipo: validacion.tipo,
  etiqueta: validacion.etiqueta,
  fuente: validacion.fuente,
  estado: validacion.estado,
  mensaje: validacion.mensaje ?? undefined,
});

export const mapearEvento = (evento: EventoTurno): EventoTurnoData => ({
  tipo: evento.tipo,
  descripcion: evento.descripcion,
  ocurridoEn: aIso(evento.ocurridoEn),
});

export const mapearFranja = (franja: Franja): FranjaData => ({
  id: franja.id,
  muelleId: franja.muelleId,
  inicio: aIso(franja.inicio),
  fin: aIso(franja.fin),
  capacidad: franja.capacidad,
  ocupados: franja.ocupados,
  cupoPrioritario: franja.cupoPrioritario,
  ocupadosRefrigerados: franja.ocupadosRefrigerados,
  disponibles: calcularDisponibilidad(franja),
});

export const mapearTurno = (turno: Turno): TurnoData => ({
  id: turno.id,
  codigo: turno.codigo,
  empresaId: turno.empresaId,
  vehiculoId: turno.vehiculoId,
  conductorId: turno.conductorId,
  muelleId: turno.muelleId,
  franjaId: turno.franjaId,
  inicio: aIso(turno.inicio),
  fin: aIso(turno.fin),
  tipoOperacion: turno.tipoOperacion,
  tipoCarga: turno.tipoCarga,
  numeroManifiesto: turno.numeroManifiesto,
  numeroBl: turno.numeroBl,
  cargaRefrigerada: turno.cargaRefrigerada,
  numeroCertificadoIca: turno.numeroCertificadoIca ?? undefined,
  estado: turno.estado,
  retrasoMinutos: turno.retrasoMinutos,
  motivoRechazo: turno.motivoRechazo ?? undefined,
  observaciones: turno.observaciones ?? undefined,
  validaciones: [...(turno.validaciones ?? [])]
    .sort((a, b) => (ORDEN_VALIDACION.get(a.tipo) ?? 0) - (ORDEN_VALIDACION.get(b.tipo) ?? 0))
    .map(mapearValidacion),
  historial: [...(turno.historial ?? [])]
    .sort((a, b) => a.ocurridoEn.getTime() - b.ocurridoEn.getTime())
    .map(mapearEvento),
  creadoEn: aIso(turno.createdAt),
});

/**
 * Resuelve los nombres relacionados que la interfaz necesita para no tener que
 * cruzar catálogos en el cliente. Requiere las relaciones ya cargadas.
 */
export const detallarTurno = (turno: Turno): TurnoDetalladoData => ({
  ...mapearTurno(turno),
  placa: turno.vehiculo?.placa ?? 'Sin placa',
  nombreConductor: turno.conductor?.nombre ?? 'Sin conductor',
  nombreMuelle: turno.muelle?.nombre ?? 'Sin muelle',
  nombreEmpresa: turno.empresa?.nombre ?? 'Sin empresa',
});

/** Relaciones que hay que cargar para poder detallar un turno */
export const RELACIONES_TURNO_DETALLADO = {
  vehiculo: true,
  conductor: true,
  muelle: true,
  empresa: true,
  validaciones: true,
  historial: true,
} as const;
