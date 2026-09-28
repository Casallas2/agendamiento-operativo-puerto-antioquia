import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { InsigniaEstadoValidacion } from '@/components/shared/InsigniaEstado';
import { cn } from '@/lib/utils';
import type { Validacion } from '../types/turnos.types';

interface LineaValidacionProps {
  validaciones: Validacion[];
}

/** Retroalimentación en vivo de RF-02: cada validación se actualiza al llegar su evento */
export const LineaValidacion = ({ validaciones }: LineaValidacionProps) => {
  const completadas = validaciones.filter((validacion) => validacion.estado === 'APROBADA' || validacion.estado === 'RECHAZADA').length;
  const porcentaje = Math.round((completadas / validaciones.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          Validación documental automática
        </CardTitle>
        <Progress value={porcentaje} className="mt-2 gap-1.5 [&_[data-slot=progress-track]]:h-2">
          <ProgressLabel className="font-normal text-muted-foreground">
            {completadas} de {validaciones.length} verificaciones completadas
          </ProgressLabel>
          <ProgressValue />
        </Progress>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {validaciones.map((validacion) => (
            <li key={validacion.tipo} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{validacion.etiqueta}</p>
                <p className="text-xs text-muted-foreground">{validacion.fuente}</p>
                {validacion.mensaje && (
                  <p className={cn('text-xs', validacion.estado === 'RECHAZADA' ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                    {validacion.mensaje}
                  </p>
                )}
              </div>
              <InsigniaEstadoValidacion estado={validacion.estado} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
