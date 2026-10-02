import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * OCI-001 · Prioridad de carga refrigerada y validación fitosanitaria ICA.
 *
 * - `turnos` sabe si transporta carga refrigerada y con qué certificado del ICA.
 * - `franjas` reserva una cuota prioritaria (30 % de la capacidad) para carga refrigerada y
 *   lleva aparte cuántos cupos ocupa esa carga, de modo que la regla se resuelve en SQL.
 * - Los enums ganan la validación `CERTIFICADO_ICA` y el sistema externo `ICA`.
 */
export class CargaRefrigeradaIca1759400000000 implements MigrationInterface {
  name = 'CargaRefrigeradaIca1759400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "turno_validaciones_tipo_enum" ADD VALUE IF NOT EXISTS 'CERTIFICADO_ICA';
      ALTER TYPE "registros_externos_sistema_enum" ADD VALUE IF NOT EXISTS 'ICA';

      ALTER TABLE "turnos"
        ADD COLUMN "carga_refrigerada" boolean NOT NULL DEFAULT false,
        ADD COLUMN "numero_certificado_ica" varchar(40);

      ALTER TABLE "franjas"
        ADD COLUMN "cupo_prioritario" integer NOT NULL DEFAULT 0,
        ADD COLUMN "ocupados_refrigerados" integer NOT NULL DEFAULT 0;

      -- Las franjas existentes reciben su cuota con la misma regla que las nuevas
      UPDATE "franjas" SET "cupo_prioritario" = FLOOR("capacidad" * 0.3);

      ALTER TABLE "franjas"
        ADD CONSTRAINT "CHK_FRANJA_CUPO_PRIORITARIO"
          CHECK ("cupo_prioritario" >= 0 AND "cupo_prioritario" <= "capacidad"),
        ADD CONSTRAINT "CHK_FRANJA_OCUPADOS_REFRIGERADOS"
          CHECK ("ocupados_refrigerados" >= 0 AND "ocupados_refrigerados" <= "ocupados");

      CREATE INDEX "IDX_TURNO_CARGA_REFRIGERADA" ON "turnos" ("carga_refrigerada")
        WHERE "carga_refrigerada" = true;
    `);
  }

  /**
   * PostgreSQL no permite quitar valores de un enum: la reversión borra los datos que los usan
   * y reconstruye ambos tipos con sus valores originales.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_TURNO_CARGA_REFRIGERADA";

      ALTER TABLE "franjas"
        DROP CONSTRAINT IF EXISTS "CHK_FRANJA_OCUPADOS_REFRIGERADOS",
        DROP CONSTRAINT IF EXISTS "CHK_FRANJA_CUPO_PRIORITARIO",
        DROP COLUMN IF EXISTS "ocupados_refrigerados",
        DROP COLUMN IF EXISTS "cupo_prioritario";

      ALTER TABLE "turnos"
        DROP COLUMN IF EXISTS "numero_certificado_ica",
        DROP COLUMN IF EXISTS "carga_refrigerada";

      DELETE FROM "turno_validaciones" WHERE "tipo" = 'CERTIFICADO_ICA';
      ALTER TYPE "turno_validaciones_tipo_enum" RENAME TO "turno_validaciones_tipo_enum_old";
      CREATE TYPE "turno_validaciones_tipo_enum" AS ENUM (
        'MANIFIESTO_DIAN', 'BL_OPERADOR', 'LICENCIA_RUNT', 'SOAT', 'TECNOMECANICA'
      );
      ALTER TABLE "turno_validaciones" ALTER COLUMN "tipo"
        TYPE "turno_validaciones_tipo_enum" USING "tipo"::text::"turno_validaciones_tipo_enum";
      DROP TYPE "turno_validaciones_tipo_enum_old";

      DELETE FROM "registros_externos" WHERE "sistema" = 'ICA';
      ALTER TYPE "registros_externos_sistema_enum" RENAME TO "registros_externos_sistema_enum_old";
      CREATE TYPE "registros_externos_sistema_enum" AS ENUM ('DIAN', 'OPERADOR_PORTUARIO');
      ALTER TABLE "registros_externos" ALTER COLUMN "sistema"
        TYPE "registros_externos_sistema_enum" USING "sistema"::text::"registros_externos_sistema_enum";
      DROP TYPE "registros_externos_sistema_enum_old";
    `);
  }
}
