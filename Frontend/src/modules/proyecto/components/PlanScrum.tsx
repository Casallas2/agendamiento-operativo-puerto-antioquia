import { CheckCircle2, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFINICION_DONE, DEFINICION_READY, PRODUCT_BACKLOG, SPRINTS } from '../data/backlog';

const ROLES_SCRUM = [
  { rol: 'Product Owner', responsabilidad: 'Prioriza el backlog según el valor para conductores, transportistas y el puerto.' },
  { rol: 'Scrum Master', responsabilidad: 'Facilita las ceremonias y elimina impedimentos (p. ej. acceso a las APIs de la DIAN).' },
  { rol: 'Developers', responsabilidad: 'Equipo multidisciplinario de frontend, backend NestJS y QA que construye el incremento.' },
];

const CEREMONIAS = [
  { nombre: 'Sprint Planning', detalle: 'Inicio de cada sprint (2 h): se elige el objetivo y las historias del Sprint Backlog.' },
  { nombre: 'Daily Scrum', detalle: '15 minutos diarios: avance, plan del día e impedimentos.' },
  { nombre: 'Sprint Review', detalle: 'Demostración del incremento al operador portuario y a transportistas.' },
  { nombre: 'Sprint Retrospective', detalle: 'Mejora del proceso del equipo antes del siguiente sprint.' },
];

const ListaVerificacion = ({ titulo, elementos }: { titulo: string; elementos: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ListChecks className="size-5 text-primary" aria-hidden />
        {titulo}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-sm">
        {elementos.map((elemento) => (
          <li key={elemento} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            {elemento}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const PlanSprints = () => (
  <div className="grid gap-4 lg:grid-cols-3">
    {SPRINTS.map((sprint) => {
      const historias = PRODUCT_BACKLOG.filter((historia) => historia.sprint === sprint.numero);
      const puntos = historias.reduce((total, historia) => total + historia.puntos, 0);
      return (
        <Card key={sprint.numero}>
          <CardHeader>
            <p className="text-xs font-medium text-primary">
              Sprint {sprint.numero} · {sprint.semanas} · {puntos} pts
            </p>
            <CardTitle className="text-lg">{sprint.nombre}</CardTitle>
            <CardDescription>{sprint.objetivo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-1">
              {historias.map((historia) => (
                <li key={historia.id} className="flex gap-2">
                  <span className="font-mono font-medium text-primary">{historia.id}</span>
                  <span className="text-muted-foreground">{historia.quiero}</span>
                </li>
              ))}
            </ul>
            <p>
              <strong>Incremento:</strong> {sprint.incremento}
            </p>
            <p className="text-muted-foreground">{sprint.justificacion}</p>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export const MarcoScrum = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {ROLES_SCRUM.map(({ rol, responsabilidad }) => (
          <p key={rol}>
            <strong>{rol}:</strong> <span className="text-muted-foreground">{responsabilidad}</span>
          </p>
        ))}
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {CEREMONIAS.map(({ nombre, detalle }) => (
          <p key={nombre}>
            <strong>{nombre}:</strong> <span className="text-muted-foreground">{detalle}</span>
          </p>
        ))}
      </CardContent>
    </Card>
    <ListaVerificacion titulo='Definición de "Ready"' elementos={DEFINICION_READY} />
    <ListaVerificacion titulo='Definición de "Done"' elementos={DEFINICION_DONE} />
  </div>
);
