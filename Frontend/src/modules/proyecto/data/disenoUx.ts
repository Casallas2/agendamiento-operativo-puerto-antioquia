import type { PrincipioUx, VistaPrototipo } from '../types/proyecto.types';

export const PRINCIPIOS_UX: PrincipioUx[] = [
  {
    principio: 'Claridad visual',
    aplicacion: 'Una acción principal por pantalla, jerarquía tipográfica fuerte y lenguaje del transporte colombiano (turno, muelle, manifiesto).',
    evidencia: 'En cabina la hora del turno se muestra a 60 px; en el panel cada página tiene título y descripción de su propósito.',
  },
  {
    principio: 'Consistencia',
    aplicacion: 'Un solo sistema de componentes (shadcn/ui sobre Base UI: botones, selects, pestañas, tablas, menús, interruptores), la misma paleta de estados y un único patrón de alertas SweetAlert2 cuyos botones y formularios reutilizan esos mismos componentes.',
    evidencia: 'Los estados del turno usan siempre el mismo icono, color y texto en la tabla, el detalle, el resumen y la cabina.',
  },
  {
    principio: 'Retroalimentación al usuario',
    aplicacion: 'Toda acción responde de inmediato: indicadores de carga, avisos emergentes y progreso de la validación en vivo.',
    evidencia: 'El detalle del turno muestra la barra de validación avanzando documento por documento a medida que responden la DIAN y el RUNT.',
  },
  {
    principio: 'Prevención y manejo de errores',
    aplicacion: 'Se bloquea lo que llevaría a un error y se explica por qué; las acciones irreversibles piden confirmación.',
    evidencia: 'Vehículos con SOAT vencido aparecen deshabilitados con el motivo, las franjas llenas tachadas, el formato del manifiesto se valida antes de enviar, la reserva exige aceptar la declaración de veracidad y cancelar un turno exige confirmar.',
  },
  {
    principio: 'Reducción de la carga de memoria',
    aplicacion: 'Reconocer en lugar de recordar: opciones visibles, resumen permanente y datos de ejemplo.',
    evidencia: 'El formulario de reserva mantiene un resumen fijo de lo elegido; las novedades del conductor se eligen de una lista sin escribir.',
  },
  {
    principio: 'Accesibilidad y adaptación al usuario final',
    aplicacion: 'Diseño centrado en el conductor en cabina (R-01): voz, botones de 96 px, modo noche y estados con icono + texto.',
    evidencia: 'Comandos de voz en español colombiano, lectura automática de avisos, contraste alto y navegación completa por teclado.',
  },
  {
    principio: 'Diseño adaptable (responsive)',
    aplicacion: 'Mobile-first: la cabina es una columna; el portal pasa de tarjetas en móvil a tablas y paneles laterales en escritorio.',
    evidencia: 'La lista de turnos se ve como tarjetas en celular y como tabla en escritorio; el menú lateral se vuelve un panel deslizable.',
  },
];

export const VISTAS_PROTOTIPO: VistaPrototipo[] = [
  {
    nombre: 'Inicio de sesión con MFA',
    ruta: '/login',
    rol: 'Todos',
    categoria: 'Pantalla principal / login',
    microservicios: 'API Gateway · Servicio de Autenticación',
    eventos: '—',
  },
  {
    nombre: 'Cabina del conductor',
    ruta: '/conductor',
    rol: 'Conductor',
    categoria: 'Módulo central operativo',
    microservicios: 'Gestión de Turnos · Notificaciones',
    eventos: 'ConductorEnCamino, NovedadReportada, MuelleRetrasado',
  },
  {
    nombre: 'Reservar turno',
    ruta: '/dashboard/turnos/nuevo',
    rol: 'Transportista',
    categoria: 'Formulario de captura de datos',
    microservicios: 'Gestión de Turnos · Validación Documental',
    eventos: 'TurnoSolicitado → TurnoValidado / TurnoRechazado',
  },
  {
    nombre: 'Estado de muelles',
    ruta: '/dashboard/muelles',
    rol: 'Operador portuario',
    categoria: 'Módulo central operativo',
    microservicios: 'Gestión de Muelles · Notificaciones',
    eventos: 'MuelleRetrasado, MuelleRestablecido, MuelleEnMantenimiento',
  },
  {
    nombre: 'Alertas y reportes',
    ruta: '/dashboard/alertas',
    rol: 'Transportista y operador',
    categoria: 'Vista de reportes / alertas',
    microservicios: 'Turnos · Muelles · Notificaciones',
    eventos: 'Consume todos los eventos para indicadores',
  },
];
