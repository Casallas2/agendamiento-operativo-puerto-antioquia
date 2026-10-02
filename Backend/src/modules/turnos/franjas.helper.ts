import { Brackets, type EntityManager } from 'typeorm';
import { calcularLimiteLiberacion } from './cupo-prioritario';
import { Franja } from './entities';

/**
 * Libera un cupo de la franja sin bajar de cero.
 * Reason: se resuelve en SQL (`GREATEST`) y no leyendo-escribiendo en memoria, para que dos
 * cancelaciones simultáneas no se pisen el contador. Si el turno era de carga refrigerada,
 * también devuelve su lugar en el contador de la cuota prioritaria (OCI-001).
 */
export const liberarCupo = async (
  gestor: EntityManager,
  franjaId: string,
  cargaRefrigerada = false,
): Promise<void> => {
  await gestor
    .createQueryBuilder()
    .update(Franja)
    .set({
      ocupados: () => 'GREATEST("ocupados" - 1, 0)',
      ...(cargaRefrigerada && {
        ocupadosRefrigerados: () => 'GREATEST("ocupados_refrigerados" - 1, 0)',
      }),
    })
    .where('id = :franjaId', { franjaId })
    .execute();
};

/**
 * Toma un cupo solo si todavía queda disponible. Devuelve `false` cuando la franja se llenó.
 * Reason: la condición `ocupados < capacidad` viaja dentro del UPDATE, de modo que la base
 * de datos arbitra la carrera por el último cupo entre dos transportistas.
 *
 * OCI-001: la carga general además debe dejar intacta la cuota prioritaria, salvo que la
 * franja empiece antes del límite de liberación. Es el mismo criterio de
 * `calcularDisponibilidad`, evaluado aquí de forma atómica.
 */
export const tomarCupo = async (
  gestor: EntityManager,
  franjaId: string,
  cargaRefrigerada = false,
  ahora: Date = new Date(),
): Promise<boolean> => {
  const consulta = gestor
    .createQueryBuilder()
    .update(Franja)
    .set({
      ocupados: () => '"ocupados" + 1',
      ...(cargaRefrigerada && { ocupadosRefrigerados: () => '"ocupados_refrigerados" + 1' }),
    })
    .where('id = :franjaId', { franjaId })
    .andWhere('"ocupados" < "capacidad"');

  if (!cargaRefrigerada) {
    consulta.andWhere(
      new Brackets((condicion) => {
        condicion
          .where('("ocupados" - "ocupados_refrigerados") < ("capacidad" - "cupo_prioritario")')
          .orWhere('"inicio" <= :limiteLiberacion', {
            limiteLiberacion: calcularLimiteLiberacion(ahora),
          });
      }),
    );
  }

  const resultado = await consulta.execute();
  return (resultado.affected ?? 0) > 0;
};
