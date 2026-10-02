import { addDays, addHours, startOfDay, subDays } from 'date-fns';
import type { EstadoTurno } from 'src/common/types/dominio.type';
import { calcularCupoPrioritario } from 'src/modules/turnos/cupo-prioritario';
import { ID, MUELLES } from './datos-maestros';

const HORAS_INICIO_FRANJA = [6, 8, 10, 12, 14, 16, 18, 20];
const DIAS_AGENDA = 7;
const HORAS_POR_FRANJA = 2;

export type FranjaSemilla = {
  id: string;
  muelleId: string;
  inicio: Date;
  fin: Date;
  capacidad: number;
  ocupados: number;
  cupoPrioritario: number;
  ocupadosRefrigerados: number;
};

export type TurnoSemilla = {
  codigo: string;
  empresaId: string;
  vehiculoId: string;
  conductorId: string;
  franja: FranjaSemilla;
  estado: EstadoTurno;
  tipoCarga: string;
  numeroManifiesto: string;
  numeroBl: string;
  cargaRefrigerada: boolean;
  numeroCertificadoIca?: string;
  creadoEn: Date;
  motivoRechazo?: string;
};

/**
 * Ocupación base determinística: la demostración se ve igual en cada siembra,
 * pero con suficiente variación para que los gráficos de ocupación no sean planos.
 */
const calcularOcupacionBase = (
  indiceDia: number,
  indiceHora: number,
  indiceMuelle: number,
  capacidad: number,
): number => {
  const valor = (indiceDia * 7 + indiceHora * 3 + indiceMuelle * 5) % (capacidad + 2);
  return Math.min(valor, capacidad);
};

/** Genera la agenda de los próximos 7 días para todos los muelles */
export const generarFranjas = (ahora: Date): FranjaSemilla[] => {
  const franjas: FranjaSemilla[] = [];

  for (let indiceDia = 0; indiceDia < DIAS_AGENDA; indiceDia += 1) {
    const dia = startOfDay(addDays(ahora, indiceDia));

    MUELLES.forEach((muelle, indiceMuelle) => {
      HORAS_INICIO_FRANJA.forEach((hora, indiceHora) => {
        const inicio = addHours(dia, hora);
        const cupoPrioritario = calcularCupoPrioritario(muelle.capacidadPorFranja);
        franjas.push({
          id: crypto.randomUUID(),
          muelleId: muelle.id,
          inicio,
          fin: addHours(inicio, HORAS_POR_FRANJA),
          capacidad: muelle.capacidadPorFranja,
          // La ocupación base es de carga general: nunca invade la cuota prioritaria
          ocupados: calcularOcupacionBase(
            indiceDia,
            indiceHora,
            indiceMuelle,
            Math.min(muelle.capacidadPorFranja - 1, muelle.capacidadPorFranja - cupoPrioritario),
          ),
          cupoPrioritario,
          ocupadosRefrigerados: 0,
        });
      });
    });
  }

  return franjas;
};

/** Primera franja de un muelle a partir de un desplazamiento en días */
const buscarFranja = (
  franjas: FranjaSemilla[],
  muelleId: string,
  referencia: Date,
  desplazamientoDias: number,
): FranjaSemilla => {
  const desde = addDays(referencia, desplazamientoDias).getTime();
  const candidatas = franjas
    .filter((franja) => franja.muelleId === muelleId && franja.inicio.getTime() >= desde)
    .sort((franjaA, franjaB) => franjaA.inicio.getTime() - franjaB.inicio.getTime());

  return candidatas[0] ?? franjas.filter((franja) => franja.muelleId === muelleId).at(-1)!;
};

/**
 * Turnos de ejemplo que cubren todos los estados visibles en la interfaz:
 * confirmado, rechazado, en camino y completado.
 */
export const generarTurnos = (ahora: Date, franjas: FranjaSemilla[]): TurnoSemilla[] => {
  const hoy = startOfDay(ahora);

  const turnos: TurnoSemilla[] = [
    {
      codigo: 'TRN-1001', empresaId: ID.empresaUraba, vehiculoId: ID.vehiculo1, conductorId: ID.conductor1,
      cargaRefrigerada: true, numeroCertificadoIca: 'CFE-2026-001204',
      franja: buscarFranja(franjas, ID.muelle2, ahora, 0), estado: 'CONFIRMADO',
      tipoCarga: 'Banano refrigerado', numeroManifiesto: 'MAN-2026-004512', numeroBl: 'BL-PA-88213',
      creadoEn: subDays(ahora, 1),
    },
    {
      codigo: 'TRN-1002', empresaId: ID.empresaUraba, vehiculoId: ID.vehiculo2, conductorId: ID.conductor2,
      cargaRefrigerada: false,
      franja: buscarFranja(franjas, ID.muelle1, addHours(hoy, 8), 1), estado: 'CONFIRMADO',
      tipoCarga: 'Contenedor seco 40 pies', numeroManifiesto: 'MAN-2026-004530', numeroBl: 'BL-PA-88240',
      creadoEn: subDays(ahora, 1),
    },
    {
      codigo: 'TRN-1003', empresaId: ID.empresaUraba, vehiculoId: ID.vehiculo2, conductorId: ID.conductor2,
      cargaRefrigerada: false,
      franja: buscarFranja(franjas, ID.muelle3, addHours(hoy, 10), 1), estado: 'RECHAZADO',
      tipoCarga: 'Carga general', numeroManifiesto: 'MAN-2026-009999', numeroBl: 'BL-PA-88251',
      creadoEn: subDays(ahora, 1),
      motivoRechazo: 'El manifiesto no se encuentra registrado en la DIAN',
    },
    {
      codigo: 'TRN-1004', empresaId: ID.empresaGolfo, vehiculoId: ID.vehiculo4, conductorId: ID.conductor4,
      cargaRefrigerada: false,
      franja: buscarFranja(franjas, ID.muelle1, ahora, 0), estado: 'EN_CAMINO',
      tipoCarga: 'Contenedor seco 20 pies', numeroManifiesto: 'MAN-2026-004498', numeroBl: 'BL-PA-88199',
      creadoEn: subDays(ahora, 2),
    },
    {
      codigo: 'TRN-1005', empresaId: ID.empresaGolfo, vehiculoId: ID.vehiculo5, conductorId: ID.conductor5,
      cargaRefrigerada: true, numeroCertificadoIca: 'CFE-2026-001190',
      franja: buscarFranja(franjas, ID.muelle2, addHours(hoy, 6), 0), estado: 'COMPLETADO',
      tipoCarga: 'Banano refrigerado', numeroManifiesto: 'MAN-2026-004470', numeroBl: 'BL-PA-88170',
      creadoEn: subDays(ahora, 2),
    },
    {
      codigo: 'TRN-1006', empresaId: ID.empresaUraba, vehiculoId: ID.vehiculo1, conductorId: ID.conductor1,
      cargaRefrigerada: true, numeroCertificadoIca: 'CFE-2026-001215',
      franja: buscarFranja(franjas, ID.muelle2, addHours(hoy, 14), 2), estado: 'CONFIRMADO',
      tipoCarga: 'Banano refrigerado', numeroManifiesto: 'MAN-2026-004545', numeroBl: 'BL-PA-88260',
      creadoEn: ahora,
    },
  ];

  // Cada turno vigente consume un cupo de su franja; los rechazados no, porque lo liberaron
  turnos.forEach((turno) => {
    if (turno.estado !== 'RECHAZADO') {
      turno.franja.ocupados = Math.min(turno.franja.ocupados + 1, turno.franja.capacidad);
      if (turno.cargaRefrigerada) {
        turno.franja.ocupadosRefrigerados += 1;
      }
    }
  });

  return turnos;
};

/** El siguiente código de turno que emitirá la secuencia de la base de datos */
export const SIGUIENTE_CODIGO_TURNO = 1007;
