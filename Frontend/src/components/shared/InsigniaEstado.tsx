import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDot,
  Clock,
  Loader2,
  Snowflake,
  Truck,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ETIQUETAS_ESTADO_MUELLE, ETIQUETAS_ESTADO_TURNO } from '@/core/config/catalogos';
import type { EstadoMuelle } from '@/modules/dashboard/muelles/types/muelles.types';
import type { EstadoTurno, EstadoValidacion } from '@/modules/dashboard/turnos/types/turnos.types';

type Tono = 'exito' | 'alerta' | 'peligro' | 'info' | 'neutro' | 'progreso';

const CLASES_TONO: Record<Tono, string> = {
  exito: 'bg-success/12 text-success ring-success/30',
  alerta: 'bg-warning/15 text-amber-700 ring-warning/40 dark:text-warning',
  peligro: 'bg-destructive/10 text-destructive ring-destructive/30',
  info: 'bg-info/10 text-info ring-info/30',
  neutro: 'bg-muted text-muted-foreground ring-border',
  progreso: 'bg-primary/10 text-primary ring-primary/30',
};

interface InsigniaBaseProps {
  etiqueta: string;
  tono: Tono;
  Icono: LucideIcon;
  animado?: boolean;
  tamano?: 'normal' | 'grande';
}

/** Estado siempre con icono + texto: nunca se comunica solo con color (accesibilidad) */
const InsigniaBase = ({ etiqueta, tono, Icono, animado, tamano = 'normal' }: InsigniaBaseProps) => (
  <Badge
    className={cn(
      'h-auto gap-1.5 ring-1 ring-inset',
      tamano === 'grande' ? 'px-3 py-1 text-sm [&>svg]:size-4!' : 'px-2 py-0.5 [&>svg]:size-3.5!',
      CLASES_TONO[tono],
    )}
  >
    <Icono className={cn(animado && 'animate-spin')} aria-hidden />
    {etiqueta}
  </Badge>
);

const CONFIGURACION_TURNO: Record<EstadoTurno, { tono: Tono; Icono: LucideIcon; animado?: boolean }> = {
  PENDIENTE_VALIDACION: { tono: 'progreso', Icono: Loader2, animado: true },
  CONFIRMADO: { tono: 'exito', Icono: CheckCircle2 },
  RECHAZADO: { tono: 'peligro', Icono: XCircle },
  EN_CAMINO: { tono: 'info', Icono: Truck },
  CON_NOVEDAD: { tono: 'alerta', Icono: AlertTriangle },
  EN_PUERTO: { tono: 'info', Icono: CircleDot },
  COMPLETADO: { tono: 'neutro', Icono: CheckCircle2 },
  CANCELADO: { tono: 'neutro', Icono: Ban },
};

interface InsigniaEstadoTurnoProps {
  estado: EstadoTurno;
  tamano?: 'normal' | 'grande';
}

export const InsigniaEstadoTurno = ({ estado, tamano }: InsigniaEstadoTurnoProps) => (
  <InsigniaBase etiqueta={ETIQUETAS_ESTADO_TURNO[estado]} tamano={tamano} {...CONFIGURACION_TURNO[estado]} />
);

const CONFIGURACION_MUELLE: Record<EstadoMuelle, { tono: Tono; Icono: LucideIcon }> = {
  OPERATIVO: { tono: 'exito', Icono: CheckCircle2 },
  RETRASADO: { tono: 'alerta', Icono: AlertTriangle },
  MANTENIMIENTO: { tono: 'neutro', Icono: Wrench },
};

export const InsigniaEstadoMuelle = ({ estado }: { estado: EstadoMuelle }) => (
  <InsigniaBase etiqueta={ETIQUETAS_ESTADO_MUELLE[estado]} {...CONFIGURACION_MUELLE[estado]} />
);

const CONFIGURACION_VALIDACION: Record<EstadoValidacion, { etiqueta: string; tono: Tono; Icono: LucideIcon; animado?: boolean }> = {
  PENDIENTE: { etiqueta: 'En cola', tono: 'neutro', Icono: Clock },
  EN_PROCESO: { etiqueta: 'Consultando', tono: 'progreso', Icono: Loader2, animado: true },
  APROBADA: { etiqueta: 'Aprobada', tono: 'exito', Icono: CheckCircle2 },
  RECHAZADA: { etiqueta: 'Rechazada', tono: 'peligro', Icono: XCircle },
};

export const InsigniaEstadoValidacion = ({ estado }: { estado: EstadoValidacion }) => (
  <InsigniaBase {...CONFIGURACION_VALIDACION[estado]} />
);

export const InsigniaSemaforo = ({ semaforo, texto }: { semaforo: 'VIGENTE' | 'POR_VENCER' | 'VENCIDO'; texto: string }) => {
  const configuracion = {
    VIGENTE: { tono: 'exito' as const, Icono: CheckCircle2 },
    POR_VENCER: { tono: 'alerta' as const, Icono: AlertTriangle },
    VENCIDO: { tono: 'peligro' as const, Icono: XCircle },
  }[semaforo];
  return <InsigniaBase etiqueta={texto} {...configuracion} />;
};

/** Turno de carga refrigerada con prioridad por cadena de frío (OCI-001) */
export const InsigniaCargaRefrigerada = ({ tamano }: { tamano?: 'normal' | 'grande' }) => (
  <InsigniaBase etiqueta="Refrigerada · prioridad" tono="info" Icono={Snowflake} tamano={tamano} />
);
