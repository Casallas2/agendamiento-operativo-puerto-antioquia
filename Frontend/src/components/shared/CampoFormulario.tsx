import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface CampoFormularioProps {
  idCampo: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: ReactNode;
}

/** Etiqueta visible + ayuda + error junto al campo: reduce la carga de memoria del usuario */
export const CampoFormulario = ({ idCampo, etiqueta, ayuda, error, children }: CampoFormularioProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={idCampo}>{etiqueta}</Label>
    {children}
    {error ? (
      <p id={`${idCampo}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
        <AlertCircle className="size-3.5" aria-hidden />
        {error}
      </p>
    ) : (
      ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>
    )}
  </div>
);
