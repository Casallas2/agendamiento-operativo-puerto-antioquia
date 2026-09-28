import { Loader2 } from 'lucide-react';

export const PantallaCarga = ({ mensaje = 'Verificando tu sesión…' }: { mensaje?: string }) => (
  <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
    <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
    <p className="text-sm">{mensaje}</p>
  </div>
);
