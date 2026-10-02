import type { RolUsuario } from '@/modules/auth/types/auth.types';
import type { EstadoMuelle } from '@/modules/dashboard/muelles/types/muelles.types';
import type {
  EstadoTurno,
  TipoOperacion,
  TipoValidacion,
  Validacion,
} from '@/modules/dashboard/turnos/types/turnos.types';

export const NOMBRE_PLATAFORMA = 'Puerto Antioquia';
export const SUBTITULO_PLATAFORMA = 'Agendamiento Operativo';

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  CONDUCTOR: 'Conductor',
  TRANSPORTISTA: 'Transportista',
  OPERADOR_PORTUARIO: 'Operador portuario',
};

export const ETIQUETAS_ESTADO_TURNO: Record<EstadoTurno, string> = {
  PENDIENTE_VALIDACION: 'Validando documentos',
  CONFIRMADO: 'Confirmado',
  RECHAZADO: 'Rechazado',
  EN_CAMINO: 'En camino',
  CON_NOVEDAD: 'Con novedad',
  EN_PUERTO: 'En puerto',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const ESTADOS_TURNO_ACTIVOS: EstadoTurno[] = [
  'PENDIENTE_VALIDACION',
  'CONFIRMADO',
  'EN_CAMINO',
  'CON_NOVEDAD',
  'EN_PUERTO',
];

export const ETIQUETAS_OPERACION: Record<TipoOperacion, string> = {
  EXPORTACION: 'Exportación',
  IMPORTACION: 'Importación',
};

export const TIPOS_CARGA = [
  'Banano refrigerado',
  'Contenedor seco 40 pies',
  'Contenedor seco 20 pies',
  'Insumos agrícolas',
  'Carga general',
];

export const ETIQUETAS_ESTADO_MUELLE: Record<EstadoMuelle, string> = {
  OPERATIVO: 'Operativo',
  RETRASADO: 'Con retraso',
  MANTENIMIENTO: 'En mantenimiento',
};

interface DefinicionValidacion {
  tipo: TipoValidacion;
  etiqueta: string;
  fuente: string;
  /** La validación solo se ejecuta para turnos de carga refrigerada */
  soloCargaRefrigerada?: boolean;
}

/** Cada validación indica el sistema externo consultado a través de su adaptador (R-02) */
export const CATALOGO_VALIDACIONES: DefinicionValidacion[] = [
  { tipo: 'MANIFIESTO_DIAN', etiqueta: 'Manifiesto de carga', fuente: 'DIAN · SOAP/XML' },
  { tipo: 'BL_OPERADOR', etiqueta: 'Conocimiento de embarque (BL)', fuente: 'Operador portuario · REST' },
  { tipo: 'LICENCIA_RUNT', etiqueta: 'Licencia de conducción', fuente: 'RUNT · vía operador' },
  { tipo: 'SOAT', etiqueta: 'SOAT del vehículo', fuente: 'RUNT · vía operador' },
  { tipo: 'TECNOMECANICA', etiqueta: 'Revisión técnico-mecánica', fuente: 'RUNT · vía operador' },
  {
    tipo: 'CERTIFICADO_ICA',
    etiqueta: 'Certificado fitosanitario',
    fuente: 'ICA · REST',
    soloCargaRefrigerada: true,
  },
];

/** Tipos de carga que viajan en contenedor refrigerado y activan la prioridad (OCI-001) */
export const TIPOS_CARGA_REFRIGERADA = ['Banano refrigerado'];

export const crearValidacionesIniciales = (
  estado: Validacion['estado'] = 'PENDIENTE',
  cargaRefrigerada = false,
): Validacion[] =>
  CATALOGO_VALIDACIONES.filter(
    (definicion) => cargaRefrigerada || !definicion.soloCargaRefrigerada,
  ).map((definicion) => ({
    ...definicion,
    estado,
    mensaje: estado === 'APROBADA' ? 'Documento verificado' : undefined,
  }));

export const CLAVE_COOKIE_CABINA = 'puerto-sesion-cabina';
export const CLAVE_COOKIE_PORTAL = 'puerto-sesion-portal';
export const CLAVE_SESION_PESTANA = 'puerto-sesion-pestana';
export const CODIGO_MFA_DEMO = '246810';
