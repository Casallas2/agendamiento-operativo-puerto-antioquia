import { forwardRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstadoDocumento } from '@/modules/dashboard/flota/types/flota.types';

const CONFIGURACION_SEMAFORO = {
  VIGENTE: { Icono: CheckCircle2, chip: 'bg-success/12 text-success', texto: 'text-success', etiqueta: 'Vigente' },
  POR_VENCER: {
    Icono: AlertTriangle,
    chip: 'bg-warning/15 text-amber-700 dark:text-warning',
    texto: 'text-amber-700 dark:text-warning',
    etiqueta: 'Por vencer',
  },
  VENCIDO: { Icono: XCircle, chip: 'bg-destructive/10 text-destructive', texto: 'text-destructive', etiqueta: 'Vencido' },
};

interface SeccionDocumentosCabinaProps {
  documentos: EstadoDocumento[];
}

export const SeccionDocumentosCabina = forwardRef<HTMLElement, SeccionDocumentosCabinaProps>(({ documentos }, ref) => (
  <section ref={ref} aria-labelledby="titulo-documentos" className="scroll-mt-24 space-y-3" tabIndex={-1}>
    <h2 id="titulo-documentos" className="font-heading text-lg font-semibold">
      Mis documentos
    </h2>
    <ul className="grid gap-2 sm:grid-cols-3">
      {documentos.map((documento) => {
        const { Icono, chip, texto, etiqueta } = CONFIGURACION_SEMAFORO[documento.semaforo];
        return (
          <li key={documento.nombre} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', chip)}>
              <Icono className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{documento.nombre}</p>
              <p className={cn('text-sm font-medium', texto)}>
                {etiqueta}
                {documento.semaforo !== 'VENCIDO' && ` · ${documento.diasRestantes} días`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
));

SeccionDocumentosCabina.displayName = 'SeccionDocumentosCabina';
