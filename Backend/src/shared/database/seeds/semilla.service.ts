import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';
import { DataSource, type EntityManager } from 'typeorm';
import { Conductor, Empresa, Vehiculo } from 'src/modules/flota/entities';
import { Muelle } from 'src/modules/muelles/entities';
import { Notificacion } from 'src/modules/notificaciones/entities';
import { PuntoEspera } from 'src/modules/reportes/entities';
import { EventoTurno, Franja, Turno, ValidacionTurno } from 'src/modules/turnos/entities';
import { Usuario } from 'src/modules/users/entities';
import { RegistroExterno } from 'src/modules/validacion/entities';
import { CATALOGO_VALIDACIONES } from 'src/modules/validacion/catalogo-validaciones';
import {
  BL_OPERADOR, CONDUCTORES, construirHistorialEspera, EMPRESAS, enDias,
  MANIFIESTOS_DIAN, MUELLES, USUARIOS, VEHICULOS,
} from './datos-maestros';
import { generarFranjas, generarTurnos, SIGUIENTE_CODIGO_TURNO, type TurnoSemilla } from './generador-agenda';
import { construirNotificaciones } from './notificaciones-semilla';

const RONDAS_BCRYPT = 12;

/** Orden de borrado: de las tablas hijas a las padres, para no violar claves foráneas */
const TABLAS_A_LIMPIAR = [
  'turno_eventos', 'turno_validaciones', 'notificaciones', 'desafios_mfa',
  'turnos', 'franjas', 'usuarios', 'vehiculos', 'conductores',
  'muelles', 'empresas', 'registros_externos', 'historial_espera',
];

/**
 * Carga los datos de demostración descritos en el Anexo del parcial.
 * Es idempotente: borra todo y vuelve a sembrar con los mismos identificadores.
 */
@Injectable()
export class SemillaService {
  private readonly logger = new Logger(SemillaService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async ejecutar(): Promise<void> {
    const ahora = new Date();
    const contrasenaDemo = this.configService.get<string>('SEMILLA_CONTRASENA_DEMO', 'Puerto2026!');
    const passwordHash = await bcrypt.hash(contrasenaDemo, RONDAS_BCRYPT);

    await this.dataSource.transaction(async (gestor) => {
      await gestor.query(`TRUNCATE TABLE ${TABLAS_A_LIMPIAR.join(', ')} RESTART IDENTITY CASCADE`);

      await this.sembrarCatalogos(gestor, ahora);
      await this.sembrarUsuarios(gestor, passwordHash);

      const franjas = generarFranjas(ahora);
      const turnos = generarTurnos(ahora, franjas);

      await gestor.save(Franja, franjas.map((franja) => gestor.create(Franja, franja)));
      const idsPorCodigo = await this.sembrarTurnos(gestor, turnos);

      await gestor.save(
        Notificacion,
        construirNotificaciones(ahora, idsPorCodigo).map((notificacion) =>
          gestor.create(Notificacion, notificacion),
        ),
      );

      await gestor.query(`ALTER SEQUENCE turnos_codigo_seq RESTART WITH ${SIGUIENTE_CODIGO_TURNO}`);
    });

    this.logger.log('Datos de demostración cargados correctamente');
  }

  private async sembrarCatalogos(gestor: EntityManager, ahora: Date): Promise<void> {
    await gestor.save(Empresa, EMPRESAS.map((empresa) => gestor.create(Empresa, empresa)));

    await gestor.save(
      Conductor,
      CONDUCTORES.map((conductor) =>
        gestor.create(Conductor, {
          ...conductor,
          vencimientoLicencia: enDias(ahora, conductor.diasLicencia),
        }),
      ),
    );

    await gestor.save(
      Vehiculo,
      VEHICULOS.map((vehiculo) =>
        gestor.create(Vehiculo, {
          ...vehiculo,
          vencimientoSoat: enDias(ahora, vehiculo.diasSoat),
          vencimientoTecnomecanica: enDias(ahora, vehiculo.diasTecnomecanica),
        }),
      ),
    );

    await gestor.save(
      Muelle,
      MUELLES.map((muelle) => gestor.create(Muelle, { ...muelle, retrasoMinutos: 0 })),
    );

    await gestor.save(RegistroExterno, [
      ...MANIFIESTOS_DIAN.map((numero) => gestor.create(RegistroExterno, { sistema: 'DIAN' as const, numero })),
      ...BL_OPERADOR.map((numero) =>
        gestor.create(RegistroExterno, { sistema: 'OPERADOR_PORTUARIO' as const, numero }),
      ),
    ]);

    await gestor.save(
      PuntoEspera,
      construirHistorialEspera(ahora).map((punto) =>
        gestor.create(PuntoEspera, {
          fecha: punto.fecha.toISOString().slice(0, 10),
          minutos: punto.minutos,
        }),
      ),
    );
  }

  private async sembrarUsuarios(gestor: EntityManager, passwordHash: string): Promise<void> {
    await gestor.save(
      Usuario,
      USUARIOS.map((usuario) => gestor.create(Usuario, { ...usuario, passwordHash, isActive: true })),
    );
  }

  /**
   * Cada turno de ejemplo llega con sus cinco validaciones resueltas y su historial.
   * Devuelve el mapa código → id para que las notificaciones puedan enlazar con su turno.
   */
  private async sembrarTurnos(
    gestor: EntityManager,
    turnos: TurnoSemilla[],
  ): Promise<Map<string, string>> {
    const idsPorCodigo = new Map<string, string>();

    for (const semilla of turnos) {
      const esRechazado = semilla.estado === 'RECHAZADO';

      const turno = await gestor.save(
        gestor.create(Turno, {
          codigo: semilla.codigo,
          empresaId: semilla.empresaId,
          vehiculoId: semilla.vehiculoId,
          conductorId: semilla.conductorId,
          muelleId: semilla.franja.muelleId,
          franjaId: semilla.franja.id,
          inicio: semilla.franja.inicio,
          fin: semilla.franja.fin,
          tipoOperacion: semilla.tipoCarga.includes('Insumos') ? 'IMPORTACION' : 'EXPORTACION',
          tipoCarga: semilla.tipoCarga,
          numeroManifiesto: semilla.numeroManifiesto,
          numeroBl: semilla.numeroBl,
          estado: semilla.estado,
          retrasoMinutos: 0,
          motivoRechazo: semilla.motivoRechazo ?? null,
          createdAt: semilla.creadoEn,
        }),
      );

      await gestor.save(
        ValidacionTurno,
        CATALOGO_VALIDACIONES.map((definicion, orden) => {
          const rechazaEsta = esRechazado && definicion.tipo === 'MANIFIESTO_DIAN';
          return gestor.create(ValidacionTurno, {
            turnoId: turno.id,
            tipo: definicion.tipo,
            etiqueta: definicion.etiqueta,
            fuente: definicion.fuente,
            estado: rechazaEsta ? ('RECHAZADA' as const) : ('APROBADA' as const),
            mensaje: rechazaEsta ? (semilla.motivoRechazo ?? null) : 'Documento verificado',
            orden,
          });
        }),
      );

      await gestor.save(EventoTurno, [
        gestor.create(EventoTurno, {
          turnoId: turno.id,
          tipo: 'TurnoSolicitado',
          descripcion: 'Solicitud de turno recibida',
          ocurridoEn: semilla.creadoEn,
        }),
        gestor.create(EventoTurno, {
          turnoId: turno.id,
          tipo: esRechazado ? 'TurnoRechazado' : 'TurnoValidado',
          descripcion: esRechazado ? 'Documentación rechazada' : 'Documentación validada y turno confirmado',
          ocurridoEn: addMinutes(semilla.creadoEn, 1),
        }),
      ]);

      idsPorCodigo.set(semilla.codigo, turno.id);
    }

    return idsPorCodigo;
  }
}
