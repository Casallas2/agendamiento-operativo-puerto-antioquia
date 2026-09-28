import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCT_BACKLOG, SPRINTS } from '../data/backlog';
import type { HistoriaUsuario, Prioridad } from '../types/proyecto.types';

const CLASES_PRIORIDAD: Record<Prioridad, string> = {
  Alta: 'bg-destructive/10 text-destructive',
  Media: 'bg-warning/15 text-amber-700 dark:text-warning',
  Baja: 'bg-muted text-muted-foreground',
};

const TarjetaHistoria = ({ historia }: { historia: HistoriaUsuario }) => (
  <article className="rounded-xl border bg-card p-5">
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm font-semibold text-primary">{historia.id}</span>
      <Badge className={CLASES_PRIORIDAD[historia.prioridad]}>Prioridad {historia.prioridad}</Badge>
      <Badge variant="outline">{historia.puntos} pts</Badge>
      <Badge variant="secondary">Sprint {historia.sprint}</Badge>
      {historia.requisitos.map((requisito) => (
        <Badge key={requisito} variant="outline" className="font-mono">
          {requisito}
        </Badge>
      ))}
      <Link href={historia.rutaPrototipo} className="ml-auto flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        Ver en el prototipo <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
    <p className="mt-3 text-base leading-relaxed">
      <strong>Como</strong> {historia.rol}, <strong>quiero</strong> {historia.quiero}, <strong>para</strong> {historia.para}.
    </p>
    <div className="mt-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Criterios de aceptación</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {historia.criteriosAceptacion.map((criterio) => (
          <li key={criterio}>{criterio}</li>
        ))}
      </ul>
    </div>
  </article>
);

const PESTANAS_BACKLOG = [
  { valor: 'todas', etiqueta: `Todas (${PRODUCT_BACKLOG.length})`, historias: PRODUCT_BACKLOG },
  ...SPRINTS.map((sprint) => {
    const historias = PRODUCT_BACKLOG.filter((historia) => historia.sprint === sprint.numero);
    return { valor: `sprint-${sprint.numero}`, etiqueta: `Sprint ${sprint.numero} (${historias.length})`, historias };
  }),
];

export const TablaBacklog = () => (
  <Tabs defaultValue="todas" className="gap-4">
    <div className="overflow-x-auto">
      <TabsList aria-label="Filtrar historias por sprint">
        {PESTANAS_BACKLOG.map((pestana) => (
          <TabsTrigger key={pestana.valor} value={pestana.valor} className="px-3">
            {pestana.etiqueta}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
    {PESTANAS_BACKLOG.map((pestana) => (
      <TabsContent key={pestana.valor} value={pestana.valor} className="space-y-4">
        {pestana.historias.map((historia) => (
          <TarjetaHistoria key={historia.id} historia={historia} />
        ))}
      </TabsContent>
    ))}
  </Tabs>
);
