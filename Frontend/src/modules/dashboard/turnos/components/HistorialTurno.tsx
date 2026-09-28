import { Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatearFechaHora } from '@/lib/formatos';
import type { EventoTurno } from '../types/turnos.types';

export const HistorialTurno = ({ historial }: { historial: EventoTurno[] }) => {
  const eventosRecientesPrimero = [...historial].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-primary" aria-hidden />
          Eventos del turno
        </CardTitle>
        <CardDescription>Trazabilidad de los eventos publicados en el bus.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l pl-5">
          {eventosRecientesPrimero.map((evento, indice) => (
            <li key={`${evento.tipo}-${evento.ocurridoEn}-${indice}`} className="relative">
              <span className="absolute top-1 -left-[26px] size-3 rounded-full border-2 border-background bg-primary" aria-hidden />
              <p className="font-mono text-xs text-primary">{evento.tipo}</p>
              <p className="text-sm">{evento.descripcion}</p>
              <p className="text-xs text-muted-foreground">{formatearFechaHora(evento.ocurridoEn)}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
