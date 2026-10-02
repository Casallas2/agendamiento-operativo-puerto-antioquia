import {
  calcularCupoPrioritario,
  calcularDisponibilidad,
  calcularRetrasoAplicable,
  cuotaLiberada,
  type OcupacionFranja,
} from './cupo-prioritario';

const AHORA = new Date('2026-10-02T12:00:00.000Z');
const EN_HORAS = (horas: number) => new Date(AHORA.getTime() + horas * 60 * 60 * 1000);

/** Franja de 10 cupos con 3 reservados para carga refrigerada, a 6 horas de empezar */
const franja = (cambios: Partial<OcupacionFranja> = {}): OcupacionFranja => ({
  capacidad: 10,
  ocupados: 0,
  cupoPrioritario: 3,
  ocupadosRefrigerados: 0,
  inicio: EN_HORAS(6),
  ...cambios,
});

describe('Cuota prioritaria de carga refrigerada (OCI-001)', () => {
  describe('calcularCupoPrioritario', () => {
    it.each([
      [10, 3],
      [8, 2],
      [6, 1],
      [4, 1],
      [3, 0],
    ])('aparta el 30 %% (redondeado hacia abajo) de una capacidad de %i → %i', (capacidad, esperado) => {
      expect(calcularCupoPrioritario(capacidad)).toBe(esperado);
    });
  });

  describe('calcularDisponibilidad', () => {
    it('con la franja vacía, la carga general solo ve los cupos fuera de la cuota', () => {
      expect(calcularDisponibilidad(franja(), AHORA)).toEqual({ general: 7, refrigerada: 10 });
    });

    it('la carga general no puede tomar la cuota aunque queden cupos libres', () => {
      const llenaParaGeneral = franja({ ocupados: 7 });
      expect(calcularDisponibilidad(llenaParaGeneral, AHORA)).toEqual({ general: 0, refrigerada: 3 });
    });

    it('la carga refrigerada consume primero la cuota y no reduce los cupos generales', () => {
      const conRefrigerados = franja({ ocupados: 3, ocupadosRefrigerados: 3 });
      expect(calcularDisponibilidad(conRefrigerados, AHORA)).toEqual({ general: 7, refrigerada: 7 });
    });

    it('si la carga refrigerada desborda la cuota, ocupa cupos generales', () => {
      const desbordada = franja({ ocupados: 5, ocupadosRefrigerados: 5 });
      expect(calcularDisponibilidad(desbordada, AHORA)).toEqual({ general: 5, refrigerada: 5 });
    });

    it('a 2 horas o menos de la franja, la cuota sin usar se libera para la carga general', () => {
      const proxima = franja({ ocupados: 7, inicio: EN_HORAS(2) });
      expect(calcularDisponibilidad(proxima, AHORA)).toEqual({ general: 3, refrigerada: 3 });
    });

    it('una franja llena no ofrece cupos a nadie', () => {
      const llena = franja({ ocupados: 10, ocupadosRefrigerados: 2 });
      expect(calcularDisponibilidad(llena, AHORA)).toEqual({ general: 0, refrigerada: 0 });
    });

    it('nunca devuelve cupos negativos aunque la ocupación de la semilla supere el tope general', () => {
      const sobreocupada = franja({ ocupados: 9 });
      expect(calcularDisponibilidad(sobreocupada, AHORA)).toEqual({ general: 0, refrigerada: 1 });
    });
  });

  describe('cuotaLiberada', () => {
    it('se libera exactamente en el límite de 2 horas', () => {
      expect(cuotaLiberada(EN_HORAS(2), AHORA)).toBe(true);
    });

    it('sigue reservada si faltan más de 2 horas', () => {
      expect(cuotaLiberada(EN_HORAS(2.1), AHORA)).toBe(false);
    });
  });

  describe('calcularRetrasoAplicable', () => {
    it('la carga general se desplaza todo el retraso del muelle', () => {
      expect(calcularRetrasoAplicable(90, false)).toBe(90);
    });

    it('la carga refrigerada se desplaza como máximo 30 minutos', () => {
      expect(calcularRetrasoAplicable(90, true)).toBe(30);
    });

    it('un retraso menor al tope se aplica completo también a la carga refrigerada', () => {
      expect(calcularRetrasoAplicable(20, true)).toBe(20);
    });
  });
});
