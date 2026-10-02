/**
 * Reglas de la cuota prioritaria para carga refrigerada (OCI-001 · RF-17).
 *
 * Cada franja aparta el 30 % de su capacidad para contenedores refrigerados: el banano de
 * exportación no puede esperar en vía sin romper la cadena de frío. La carga general no
 * toma esos cupos, salvo cuando faltan 2 horas o menos para la franja y nadie los usó.
 * La carga refrigerada, en cambio, puede usar cualquier cupo libre.
 */

export const PORCENTAJE_CUPO_PRIORITARIO = 0.3;
export const HORAS_LIBERACION_CUPO_PRIORITARIO = 2;
/** Tope de desplazamiento de un turno refrigerado ante un retraso de muelle */
export const MINUTOS_MAXIMOS_RETRASO_REFRIGERADA = 30;

const MS_POR_HORA = 60 * 60 * 1000;

export type OcupacionFranja = {
  capacidad: number;
  ocupados: number;
  cupoPrioritario: number;
  ocupadosRefrigerados: number;
  inicio: Date;
};

export type DisponibilidadFranja = {
  /** Cupos que puede tomar un turno de carga general */
  general: number;
  /** Cupos que puede tomar un turno de carga refrigerada */
  refrigerada: number;
};

export const calcularCupoPrioritario = (capacidad: number): number =>
  Math.floor(capacidad * PORCENTAJE_CUPO_PRIORITARIO);

/** Momento a partir del cual la cuota sin usar queda libre para la carga general */
export const calcularLimiteLiberacion = (ahora: Date): Date =>
  new Date(ahora.getTime() + HORAS_LIBERACION_CUPO_PRIORITARIO * MS_POR_HORA);

export const cuotaLiberada = (inicio: Date, ahora: Date): boolean =>
  inicio.getTime() <= calcularLimiteLiberacion(ahora).getTime();

/**
 * Cupos disponibles para cada tipo de carga.
 * Reason: es el mismo criterio que `tomarCupo` evalúa dentro del UPDATE; aquí se usa para
 * informar a la interfaz y en las pruebas, mientras que la base de datos arbitra la carrera.
 */
export const calcularDisponibilidad = (
  franja: OcupacionFranja,
  ahora: Date = new Date(),
): DisponibilidadFranja => {
  const libres = Math.max(franja.capacidad - franja.ocupados, 0);
  if (cuotaLiberada(franja.inicio, ahora)) {
    return { general: libres, refrigerada: libres };
  }

  const ocupadosGenerales = franja.ocupados - franja.ocupadosRefrigerados;
  const libresGenerales = franja.capacidad - franja.cupoPrioritario - ocupadosGenerales;

  return {
    general: Math.max(Math.min(libres, libresGenerales), 0),
    refrigerada: libres,
  };
};

/** Minutos que se desplaza un turno ante un retraso: la carga refrigerada se atiende primero */
export const calcularRetrasoAplicable = (minutosRetraso: number, cargaRefrigerada: boolean): number =>
  cargaRefrigerada ? Math.min(minutosRetraso, MINUTOS_MAXIMOS_RETRASO_REFRIGERADA) : minutosRetraso;
