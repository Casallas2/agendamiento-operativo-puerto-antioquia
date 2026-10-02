/**
 * Vocabulario de dominio compartido por todos los módulos.
 * Reason: estas uniones son espejo exacto de los tipos que el frontend declara en
 * `Frontend/src/modules/<módulo>/types`, de modo que el contrato JSON no requiere traducción.
 */

export type RolUsuario = 'CONDUCTOR' | 'TRANSPORTISTA' | 'OPERADOR_PORTUARIO';

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

export type EstadoMuelle = 'OPERATIVO' | 'RETRASADO' | 'MANTENIMIENTO';

export type EstadoRunt = 'ACTIVO' | 'SUSPENDIDO';

export type TipoNotificacion = 'INFO' | 'EXITO' | 'ALERTA' | 'ERROR';

export type CanalNotificacion = 'PUSH' | 'SMS' | 'VOZ';

export type SeveridadEvento = TipoNotificacion;

export type TipoEventoDominio =
  | 'TurnoSolicitado'
  | 'ValidacionActualizada'
  | 'TurnoValidado'
  | 'TurnoRechazado'
  | 'TurnoCancelado'
  | 'ConductorEnCamino'
  | 'NovedadReportada'
  | 'MuelleRetrasado'
  | 'MuelleRestablecido'
  | 'MuelleEnMantenimiento';

export type SistemaExterno = 'DIAN' | 'OPERADOR_PORTUARIO' | 'ICA';

/** Lista de valores para las columnas `enum` de TypeORM y las migraciones */
export const ROLES_USUARIO: RolUsuario[] = ['CONDUCTOR', 'TRANSPORTISTA', 'OPERADOR_PORTUARIO'];
export const ESTADOS_TURNO: EstadoTurno[] = [
  'PENDIENTE_VALIDACION', 'CONFIRMADO', 'RECHAZADO', 'EN_CAMINO', 'CON_NOVEDAD',
  'EN_PUERTO', 'COMPLETADO', 'CANCELADO',
];
export const TIPOS_OPERACION: TipoOperacion[] = ['EXPORTACION', 'IMPORTACION'];
export const TIPOS_VALIDACION: TipoValidacion[] = [
  'MANIFIESTO_DIAN', 'BL_OPERADOR', 'LICENCIA_RUNT', 'SOAT', 'TECNOMECANICA', 'CERTIFICADO_ICA',
];
export const ESTADOS_VALIDACION: EstadoValidacion[] = ['PENDIENTE', 'EN_PROCESO', 'APROBADA', 'RECHAZADA'];
export const ESTADOS_MUELLE: EstadoMuelle[] = ['OPERATIVO', 'RETRASADO', 'MANTENIMIENTO'];
export const ESTADOS_RUNT: EstadoRunt[] = ['ACTIVO', 'SUSPENDIDO'];
export const TIPOS_NOTIFICACION: TipoNotificacion[] = ['INFO', 'EXITO', 'ALERTA', 'ERROR'];
export const SISTEMAS_EXTERNOS: SistemaExterno[] = ['DIAN', 'OPERADOR_PORTUARIO', 'ICA'];
