import { addMinutes, format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatearHora = (fechaIso: string, minutosExtra = 0) =>
  format(addMinutes(new Date(fechaIso), minutosExtra), 'h:mm a', { locale: es });

export const formatearDiaRelativo = (fechaIso: string) => {
  const fecha = new Date(fechaIso);
  if (isToday(fecha)) {
    return 'Hoy';
  }
  if (isTomorrow(fecha)) {
    return 'Mañana';
  }
  const texto = format(fecha, "EEEE d 'de' MMMM", { locale: es });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const formatearFechaCorta = (fechaIso: string) => format(new Date(fechaIso), 'd MMM yyyy', { locale: es });

export const formatearFechaHora = (fechaIso: string) => format(new Date(fechaIso), "d MMM, h:mm a", { locale: es });

/** Ventana de atención con el retraso del muelle ya aplicado */
export const formatearVentana = (inicio: string, fin: string, retrasoMinutos = 0) =>
  `${formatearHora(inicio, retrasoMinutos)} – ${formatearHora(fin, retrasoMinutos)}`;

export const formatearTiempoRelativo = (fechaIso: string) =>
  formatDistanceToNow(new Date(fechaIso), { locale: es, addSuffix: true });

export const obtenerIniciales = (nombre: string) =>
  nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
