import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial del sistema de Agendamiento Operativo.
 * Convenciones: identificadores UUID, columnas en snake_case y `created_at`/`updated_at`
 * obligatorios en todas las tablas.
 */
export class EsquemaInicial1758300000000 implements MigrationInterface {
  name = 'EsquemaInicial1758300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Necesaria para generar los UUID del lado de la base de datos
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await this.crearTipos(queryRunner);
    await this.crearCatalogos(queryRunner);
    await this.crearOperacion(queryRunner);
    await this.crearSoporte(queryRunner);

    // Secuencia de los códigos visibles de turno (TRN-1007, TRN-1008, ...)
    await queryRunner.query('CREATE SEQUENCE IF NOT EXISTS turnos_codigo_seq START WITH 1007;');
  }

  private async crearTipos(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "usuarios_rol_enum" AS ENUM ('CONDUCTOR', 'TRANSPORTISTA', 'OPERADOR_PORTUARIO');
      CREATE TYPE "vehiculos_estado_runt_enum" AS ENUM ('ACTIVO', 'SUSPENDIDO');
      CREATE TYPE "muelles_estado_enum" AS ENUM ('OPERATIVO', 'RETRASADO', 'MANTENIMIENTO');
      CREATE TYPE "turnos_estado_enum" AS ENUM (
        'PENDIENTE_VALIDACION', 'CONFIRMADO', 'RECHAZADO', 'EN_CAMINO',
        'EN_PUERTO', 'COMPLETADO', 'CANCELADO'
      );
      CREATE TYPE "turnos_tipo_operacion_enum" AS ENUM ('EXPORTACION', 'IMPORTACION');
      CREATE TYPE "turno_validaciones_tipo_enum" AS ENUM (
        'MANIFIESTO_DIAN', 'BL_OPERADOR', 'LICENCIA_RUNT', 'SOAT', 'TECNOMECANICA'
      );
      CREATE TYPE "turno_validaciones_estado_enum" AS ENUM (
        'PENDIENTE', 'EN_PROCESO', 'APROBADA', 'RECHAZADA'
      );
      CREATE TYPE "notificaciones_tipo_enum" AS ENUM ('INFO', 'EXITO', 'ALERTA', 'ERROR');
      CREATE TYPE "registros_externos_sistema_enum" AS ENUM ('DIAN', 'OPERADOR_PORTUARIO');
    `);
  }

  /** Empresas, conductores, vehículos, usuarios y muelles */
  private async crearCatalogos(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "empresas" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nombre" varchar(150) NOT NULL,
        "nit" varchar(30) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_EMPRESA_NIT" ON "empresas" ("nit");

      CREATE TABLE "conductores" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nombre" varchar(150) NOT NULL,
        "cedula" varchar(30) NOT NULL,
        "telefono" varchar(30) NOT NULL,
        "categoria_licencia" varchar(10) NOT NULL,
        "vencimiento_licencia" timestamptz NOT NULL,
        "empresa_id" uuid NOT NULL REFERENCES "empresas" ("id") ON DELETE CASCADE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_CONDUCTOR_CEDULA" ON "conductores" ("cedula");
      CREATE INDEX "IDX_CONDUCTOR_EMPRESA" ON "conductores" ("empresa_id");

      CREATE TABLE "vehiculos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "placa" varchar(10) NOT NULL,
        "tipo" varchar(80) NOT NULL,
        "marca" varchar(80) NOT NULL,
        "empresa_id" uuid NOT NULL REFERENCES "empresas" ("id") ON DELETE CASCADE,
        "estado_runt" "vehiculos_estado_runt_enum" NOT NULL DEFAULT 'ACTIVO',
        "vencimiento_soat" timestamptz NOT NULL,
        "vencimiento_tecnomecanica" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_VEHICULO_PLACA" ON "vehiculos" ("placa");
      CREATE INDEX "IDX_VEHICULO_EMPRESA" ON "vehiculos" ("empresa_id");

      CREATE TABLE "usuarios" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nombre" varchar(150) NOT NULL,
        "correo" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "rol" "usuarios_rol_enum" NOT NULL,
        "telefono" varchar(30) NOT NULL,
        "empresa_id" uuid REFERENCES "empresas" ("id") ON DELETE SET NULL,
        "empresa_nombre" varchar(150),
        "conductor_id" uuid REFERENCES "conductores" ("id") ON DELETE SET NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_USUARIO_CORREO" ON "usuarios" ("correo");
      CREATE INDEX "IDX_USUARIO_ROL" ON "usuarios" ("rol");
      CREATE INDEX "IDX_USUARIO_ACTIVO" ON "usuarios" ("is_active");

      CREATE TABLE "muelles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "nombre" varchar(80) NOT NULL,
        "tipo_carga" varchar(80) NOT NULL,
        "estado" "muelles_estado_enum" NOT NULL DEFAULT 'OPERATIVO',
        "retraso_minutos" integer NOT NULL DEFAULT 0,
        "motivo_novedad" varchar(255),
        "capacidad_por_franja" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "IDX_MUELLE_ESTADO" ON "muelles" ("estado");
    `);
  }

  /** Franjas, turnos, validaciones e historial */
  private async crearOperacion(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "franjas" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "muelle_id" uuid NOT NULL REFERENCES "muelles" ("id") ON DELETE CASCADE,
        "inicio" timestamptz NOT NULL,
        "fin" timestamptz NOT NULL,
        "capacidad" integer NOT NULL,
        "ocupados" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_FRANJA_OCUPADOS" CHECK ("ocupados" >= 0 AND "ocupados" <= "capacidad")
      );
      CREATE INDEX "IDX_FRANJA_INICIO" ON "franjas" ("inicio");
      CREATE INDEX "IDX_FRANJA_MUELLE_INICIO" ON "franjas" ("muelle_id", "inicio");

      CREATE TABLE "turnos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "codigo" varchar(20) NOT NULL,
        "empresa_id" uuid NOT NULL REFERENCES "empresas" ("id") ON DELETE CASCADE,
        "vehiculo_id" uuid NOT NULL REFERENCES "vehiculos" ("id") ON DELETE RESTRICT,
        "conductor_id" uuid NOT NULL REFERENCES "conductores" ("id") ON DELETE RESTRICT,
        "muelle_id" uuid NOT NULL REFERENCES "muelles" ("id") ON DELETE RESTRICT,
        "franja_id" uuid NOT NULL REFERENCES "franjas" ("id") ON DELETE RESTRICT,
        "inicio" timestamptz NOT NULL,
        "fin" timestamptz NOT NULL,
        "tipo_operacion" "turnos_tipo_operacion_enum" NOT NULL,
        "tipo_carga" varchar(80) NOT NULL,
        "numero_manifiesto" varchar(40) NOT NULL,
        "numero_bl" varchar(40) NOT NULL,
        "estado" "turnos_estado_enum" NOT NULL DEFAULT 'PENDIENTE_VALIDACION',
        "retraso_minutos" integer NOT NULL DEFAULT 0,
        "motivo_rechazo" varchar(255),
        "observaciones" varchar(500),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_TURNO_CODIGO" ON "turnos" ("codigo");
      CREATE INDEX "IDX_TURNO_EMPRESA" ON "turnos" ("empresa_id");
      CREATE INDEX "IDX_TURNO_CONDUCTOR" ON "turnos" ("conductor_id");
      CREATE INDEX "IDX_TURNO_MUELLE" ON "turnos" ("muelle_id");
      CREATE INDEX "IDX_TURNO_ESTADO" ON "turnos" ("estado");
      CREATE INDEX "IDX_TURNO_INICIO" ON "turnos" ("inicio");
      CREATE INDEX "IDX_TURNO_MANIFIESTO" ON "turnos" ("numero_manifiesto");

      CREATE TABLE "turno_validaciones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "turno_id" uuid NOT NULL REFERENCES "turnos" ("id") ON DELETE CASCADE,
        "tipo" "turno_validaciones_tipo_enum" NOT NULL,
        "etiqueta" varchar(80) NOT NULL,
        "fuente" varchar(80) NOT NULL,
        "estado" "turno_validaciones_estado_enum" NOT NULL DEFAULT 'PENDIENTE',
        "mensaje" varchar(255),
        "orden" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_VALIDACION_TURNO_TIPO" ON "turno_validaciones" ("turno_id", "tipo");

      CREATE TABLE "turno_eventos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "turno_id" uuid NOT NULL REFERENCES "turnos" ("id") ON DELETE CASCADE,
        "tipo" varchar(50) NOT NULL,
        "descripcion" varchar(255) NOT NULL,
        "ocurrido_en" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "IDX_EVENTO_TURNO" ON "turno_eventos" ("turno_id");
    `);
  }

  /** Notificaciones, desafíos MFA, registros externos e histórico de espera */
  private async crearSoporte(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notificaciones" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_id" uuid NOT NULL REFERENCES "usuarios" ("id") ON DELETE CASCADE,
        "titulo" varchar(150) NOT NULL,
        "mensaje" varchar(500) NOT NULL,
        "tipo" "notificaciones_tipo_enum" NOT NULL DEFAULT 'INFO',
        "canales" text[] NOT NULL DEFAULT '{}',
        "turno_id" uuid,
        "leida" boolean NOT NULL DEFAULT false,
        "creada_en" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "IDX_NOTIFICACION_USUARIO_FECHA" ON "notificaciones" ("usuario_id", "creada_en");

      CREATE TABLE "desafios_mfa" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "usuario_id" uuid NOT NULL REFERENCES "usuarios" ("id") ON DELETE CASCADE,
        "intentos" integer NOT NULL DEFAULT 0,
        "expira_en" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "IDX_DESAFIO_USUARIO" ON "desafios_mfa" ("usuario_id");

      CREATE TABLE "registros_externos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sistema" "registros_externos_sistema_enum" NOT NULL,
        "numero" varchar(40) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_REGISTRO_SISTEMA_NUMERO" ON "registros_externos" ("sistema", "numero");

      CREATE TABLE "historial_espera" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "fecha" date NOT NULL,
        "minutos" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "IDX_ESPERA_FECHA" ON "historial_espera" ("fecha");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP SEQUENCE IF EXISTS turnos_codigo_seq;
      DROP TABLE IF EXISTS "historial_espera", "registros_externos", "desafios_mfa",
        "notificaciones", "turno_eventos", "turno_validaciones", "turnos", "franjas",
        "usuarios", "vehiculos", "conductores", "muelles", "empresas" CASCADE;
      DROP TYPE IF EXISTS "registros_externos_sistema_enum", "notificaciones_tipo_enum",
        "turno_validaciones_estado_enum", "turno_validaciones_tipo_enum",
        "turnos_tipo_operacion_enum", "turnos_estado_enum", "muelles_estado_enum",
        "vehiculos_estado_runt_enum", "usuarios_rol_enum";
    `);
  }
}
