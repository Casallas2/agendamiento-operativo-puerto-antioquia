import { addDays, startOfDay, subDays } from 'date-fns';
import type { EstadoMuelle, EstadoRunt, RolUsuario } from 'src/common/types/dominio.type';

/**
 * Identificadores fijos de la demostración.
 * Reason: al ser constantes, volver a sembrar deja la base exactamente igual y los enlaces
 * que alguien guarde durante la sustentación siguen funcionando.
 */
export const ID = {
  empresaUraba: '11111111-1111-4111-8111-000000000001',
  empresaGolfo: '11111111-1111-4111-8111-000000000002',
  vehiculo1: '22222222-2222-4222-8222-000000000001',
  vehiculo2: '22222222-2222-4222-8222-000000000002',
  vehiculo3: '22222222-2222-4222-8222-000000000003',
  vehiculo4: '22222222-2222-4222-8222-000000000004',
  vehiculo5: '22222222-2222-4222-8222-000000000005',
  conductor1: '33333333-3333-4333-8333-000000000001',
  conductor2: '33333333-3333-4333-8333-000000000002',
  conductor3: '33333333-3333-4333-8333-000000000003',
  conductor4: '33333333-3333-4333-8333-000000000004',
  conductor5: '33333333-3333-4333-8333-000000000005',
  muelle1: '44444444-4444-4444-8444-000000000001',
  muelle2: '44444444-4444-4444-8444-000000000002',
  muelle3: '44444444-4444-4444-8444-000000000003',
  muelle4: '44444444-4444-4444-8444-000000000004',
  usuarioOperador: '55555555-5555-4555-8555-000000000001',
  usuarioTransportista: '55555555-5555-4555-8555-000000000002',
  usuarioConductor: '55555555-5555-4555-8555-000000000003',
} as const;

export type SemillaEmpresa = { id: string; nombre: string; nit: string };
export type SemillaUsuario = {
  id: string; nombre: string; correo: string; rol: RolUsuario; telefono: string;
  empresaId: string | null; empresaNombre: string; conductorId: string | null;
};
export type SemillaVehiculo = {
  id: string; placa: string; tipo: string; marca: string; empresaId: string;
  estadoRunt: EstadoRunt; diasSoat: number; diasTecnomecanica: number;
};
export type SemillaConductor = {
  id: string; nombre: string; cedula: string; telefono: string;
  categoriaLicencia: string; diasLicencia: number; empresaId: string;
};
export type SemillaMuelle = {
  id: string; nombre: string; tipoCarga: string; estado: EstadoMuelle;
  motivoNovedad: string | null; capacidadPorFranja: number;
};

export const EMPRESAS: SemillaEmpresa[] = [
  { id: ID.empresaUraba, nombre: 'Transportes Urabá S.A.S.', nit: '900.456.321-7' },
  { id: ID.empresaGolfo, nombre: 'Logística del Golfo Ltda.', nit: '901.223.884-1' },
];

export const USUARIOS: SemillaUsuario[] = [
  {
    id: ID.usuarioOperador, nombre: 'Laura Restrepo', correo: 'operador@puertoantioquia.co',
    rol: 'OPERADOR_PORTUARIO', telefono: '+57 310 555 4521',
    empresaId: null, empresaNombre: 'Puerto Antioquia', conductorId: null,
  },
  {
    id: ID.usuarioTransportista, nombre: 'Andrés Pineda', correo: 'transportista@transuraba.co',
    rol: 'TRANSPORTISTA', telefono: '+57 315 555 2290',
    empresaId: ID.empresaUraba, empresaNombre: 'Transportes Urabá S.A.S.', conductorId: null,
  },
  {
    id: ID.usuarioConductor, nombre: 'Carlos Mena', correo: 'conductor@transuraba.co',
    rol: 'CONDUCTOR', telefono: '+57 312 555 7810',
    empresaId: ID.empresaUraba, empresaNombre: 'Transportes Urabá S.A.S.', conductorId: ID.conductor1,
  },
];

/** Los vencimientos se declaran en días relativos a hoy para que el semáforo siempre se vea igual */
export const VEHICULOS: SemillaVehiculo[] = [
  { id: ID.vehiculo1, placa: 'TTK-482', tipo: 'Tractocamión refrigerado', marca: 'Kenworth T800', empresaId: ID.empresaUraba, estadoRunt: 'ACTIVO', diasSoat: 210, diasTecnomecanica: 95 },
  { id: ID.vehiculo2, placa: 'SNZ-915', tipo: 'Tractocamión', marca: 'International ProStar', empresaId: ID.empresaUraba, estadoRunt: 'ACTIVO', diasSoat: 12, diasTecnomecanica: 160 },
  { id: ID.vehiculo3, placa: 'WPL-230', tipo: 'Tractocamión', marca: 'Freightliner Cascadia', empresaId: ID.empresaUraba, estadoRunt: 'ACTIVO', diasSoat: -4, diasTecnomecanica: 40 },
  { id: ID.vehiculo4, placa: 'GHT-771', tipo: 'Tractocamión', marca: 'Volvo FH', empresaId: ID.empresaGolfo, estadoRunt: 'ACTIVO', diasSoat: 120, diasTecnomecanica: 80 },
  { id: ID.vehiculo5, placa: 'KLM-308', tipo: 'Tractocamión refrigerado', marca: 'Kenworth T880', empresaId: ID.empresaGolfo, estadoRunt: 'ACTIVO', diasSoat: 300, diasTecnomecanica: 200 },
];

export const CONDUCTORES: SemillaConductor[] = [
  { id: ID.conductor1, nombre: 'Carlos Mena', cedula: '1.045.112.874', telefono: '+57 312 555 7810', categoriaLicencia: 'C3', diasLicencia: 540, empresaId: ID.empresaUraba },
  { id: ID.conductor2, nombre: 'Luis Palacios', cedula: '71.998.402', telefono: '+57 314 555 1022', categoriaLicencia: 'C3', diasLicencia: 25, empresaId: ID.empresaUraba },
  { id: ID.conductor3, nombre: 'Yeison Córdoba', cedula: '1.027.884.551', telefono: '+57 311 555 6634', categoriaLicencia: 'C2', diasLicencia: -10, empresaId: ID.empresaUraba },
  { id: ID.conductor4, nombre: 'Mario Hinestroza', cedula: '8.402.119', telefono: '+57 313 555 9044', categoriaLicencia: 'C3', diasLicencia: 700, empresaId: ID.empresaGolfo },
  { id: ID.conductor5, nombre: 'Julio Mosquera', cedula: '1.040.556.201', telefono: '+57 316 555 3310', categoriaLicencia: 'C3', diasLicencia: 400, empresaId: ID.empresaGolfo },
];

export const MUELLES: SemillaMuelle[] = [
  { id: ID.muelle1, nombre: 'Muelle 1', tipoCarga: 'Contenedores', estado: 'OPERATIVO', motivoNovedad: null, capacidadPorFranja: 6 },
  { id: ID.muelle2, nombre: 'Muelle 2', tipoCarga: 'Banano refrigerado', estado: 'OPERATIVO', motivoNovedad: null, capacidadPorFranja: 8 },
  { id: ID.muelle3, nombre: 'Muelle 3', tipoCarga: 'Carga general', estado: 'OPERATIVO', motivoNovedad: null, capacidadPorFranja: 5 },
  { id: ID.muelle4, nombre: 'Muelle 4', tipoCarga: 'Insumos agrícolas', estado: 'MANTENIMIENTO', motivoNovedad: 'Mantenimiento preventivo de grúa pórtico', capacidadPorFranja: 4 },
];

/** Manifiestos que la DIAN reconoce como registrados */
export const MANIFIESTOS_DIAN = [
  'MAN-2026-004470', 'MAN-2026-004498', 'MAN-2026-004512', 'MAN-2026-004530',
  'MAN-2026-004545', 'MAN-2026-004561', 'MAN-2026-004577', 'MAN-2026-004590',
];

/** Conocimientos de embarque registrados por el operador portuario */
export const BL_OPERADOR = [
  'BL-PA-88170', 'BL-PA-88199', 'BL-PA-88213', 'BL-PA-88240', 'BL-PA-88251',
  'BL-PA-88260', 'BL-PA-88275', 'BL-PA-88288', 'BL-PA-88301',
];

/**
 * Certificados fitosanitarios que el ICA reconoce como expedidos (OCI-001).
 * Para demostrar un rechazo basta usar uno que no esté aquí, como CFE-2026-009999.
 */
export const CERTIFICADOS_ICA = [
  'CFE-2026-001190', 'CFE-2026-001204', 'CFE-2026-001215', 'CFE-2026-001230', 'CFE-2026-001247',
];

/** Serie de espera en vía de los últimos 10 días: muestra la reducción lograda (RNF-03) */
const MINUTOS_ESPERA = [312, 295, 280, 240, 198, 170, 142, 120, 96, 84];

export const construirHistorialEspera = (ahora: Date) =>
  MINUTOS_ESPERA.map((minutos, indice) => ({
    fecha: subDays(startOfDay(ahora), MINUTOS_ESPERA.length - 1 - indice),
    minutos,
  }));

/** Convierte los días relativos de la semilla en una fecha absoluta */
export const enDias = (ahora: Date, dias: number): Date => addDays(startOfDay(ahora), dias);
