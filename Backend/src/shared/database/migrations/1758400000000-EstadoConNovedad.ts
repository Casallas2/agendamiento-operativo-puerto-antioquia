import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Añade el estado `CON_NOVEDAD`: cuando el conductor reporta una novedad, el turno deja de
 * estar en curso hasta que él mismo retome el viaje.
 */
export class EstadoConNovedad1758400000000 implements MigrationInterface {
  name = 'EstadoConNovedad1758400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Se inserta después de EN_CAMINO para que el orden del enum siga la secuencia del viaje
    await queryRunner.query(
      `ALTER TYPE "turnos_estado_enum" ADD VALUE IF NOT EXISTS 'CON_NOVEDAD' AFTER 'EN_CAMINO'`,
    );
  }

  /**
   * PostgreSQL no permite quitar un valor de un enum, así que la reversión reconstruye el
   * tipo. Los turnos que estuvieran en `CON_NOVEDAD` vuelven a `EN_CAMINO`, que es el estado
   * del que salieron.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "turnos" SET "estado" = 'EN_CAMINO' WHERE "estado" = 'CON_NOVEDAD';

      ALTER TYPE "turnos_estado_enum" RENAME TO "turnos_estado_enum_old";

      CREATE TYPE "turnos_estado_enum" AS ENUM (
        'PENDIENTE_VALIDACION', 'CONFIRMADO', 'RECHAZADO', 'EN_CAMINO',
        'EN_PUERTO', 'COMPLETADO', 'CANCELADO'
      );

      ALTER TABLE "turnos" ALTER COLUMN "estado" DROP DEFAULT;
      ALTER TABLE "turnos" ALTER COLUMN "estado"
        TYPE "turnos_estado_enum" USING "estado"::text::"turnos_estado_enum";
      ALTER TABLE "turnos" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_VALIDACION';

      DROP TYPE "turnos_estado_enum_old";
    `);
  }
}
