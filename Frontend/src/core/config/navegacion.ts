import {
  BarChart3,
  CalendarPlus,
  ClipboardList,
  LayoutDashboard,
  Ship,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { RolUsuario } from '@/modules/auth/types/auth.types';

export interface ElementoNavegacion {
  ruta: string;
  etiqueta: string;
  Icono: LucideIcon;
  roles: RolUsuario[];
  coincidenciaExacta?: boolean;
}

export const ELEMENTOS_NAVEGACION: ElementoNavegacion[] = [
  { ruta: '/dashboard', etiqueta: 'Resumen', Icono: LayoutDashboard, roles: ['TRANSPORTISTA', 'OPERADOR_PORTUARIO'], coincidenciaExacta: true },
  { ruta: '/dashboard/turnos/nuevo', etiqueta: 'Reservar turno', Icono: CalendarPlus, roles: ['TRANSPORTISTA'], coincidenciaExacta: true },
  { ruta: '/dashboard/turnos', etiqueta: 'Turnos', Icono: ClipboardList, roles: ['TRANSPORTISTA', 'OPERADOR_PORTUARIO'] },
  { ruta: '/dashboard/muelles', etiqueta: 'Muelles', Icono: Ship, roles: ['OPERADOR_PORTUARIO'] },
  { ruta: '/dashboard/flota', etiqueta: 'Flota y documentos', Icono: Truck, roles: ['TRANSPORTISTA'] },
  { ruta: '/dashboard/alertas', etiqueta: 'Alertas y reportes', Icono: BarChart3, roles: ['TRANSPORTISTA', 'OPERADOR_PORTUARIO'] },
];

/** Rutas restringidas por rol: se validan con el rol confirmado por el servidor (useMe) */
export const RUTAS_POR_ROL: Record<string, RolUsuario[]> = {
  '/dashboard/turnos/nuevo': ['TRANSPORTISTA'],
  '/dashboard/muelles': ['OPERADOR_PORTUARIO'],
  '/dashboard/flota': ['TRANSPORTISTA'],
};

export const esRutaActiva = (rutaActual: string, elemento: ElementoNavegacion) => {
  if (elemento.coincidenciaExacta) {
    return rutaActual === elemento.ruta;
  }
  return rutaActual === elemento.ruta || (rutaActual.startsWith(`${elemento.ruta}/`) && !rutaActual.endsWith('/nuevo'));
};
