import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BotonTema } from '@/components/shared/BotonTema';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { Logo } from '@/components/shared/Logo';
import { MarcoScrum, PlanSprints } from '../components/PlanScrum';
import { PrincipiosUx, TablaVistas } from '../components/SeccionDisenoUx';
import { TablaBacklog } from '../components/TablaBacklog';

const SECCIONES = [
  { id: 'vistas', titulo: 'Vistas del prototipo' },
  { id: 'principios', titulo: 'Justificación UI/UX' },
  { id: 'backlog', titulo: 'Product Backlog' },
  { id: 'sprints', titulo: 'Sprints' },
  { id: 'scrum', titulo: 'Marco Scrum' },
  { id: 'sustentacion', titulo: 'Sustentación' },
];

const PUNTOS_SUSTENTACION = [
  'El problema: filas de kilómetros en la vía a Turbo por llegadas sin turno; el usuario crítico es el conductor en cabina.',
  'Tres perfiles, tres experiencias: cabina por voz para el conductor, portal de reservas para el transportista y tablero de muelles para el operador.',
  'Demostración en vivo: reservar un turno → ver la validación asíncrona → declarar un retraso en el muelle → el conductor lo escucha al instante.',
  'Acople con la arquitectura: cada pantalla consume un microservicio vía API Gateway y reacciona a eventos del bus (Observer); la validación usa adaptadores DIAN/operador (Adapter).',
  'Principios de UI aplicados: claridad, consistencia, retroalimentación, prevención de errores y reducción de la carga de memoria.',
  'Plan ágil: 10 historias priorizadas en 3 sprints de 2 semanas que entregan valor incremental desde el primer sprint.',
];

const Seccion = ({ id, titulo, descripcion, children }: { id: string; titulo: string; descripcion: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-24 space-y-4">
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight">{titulo}</h2>
      <p className="max-w-3xl text-muted-foreground">{descripcion}</p>
    </div>
    {children}
  </section>
);

export const ProyectoView = () => (
  <div className="flex-1">
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/">
          <Logo compacto />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <BotonTema />
          <EnlaceBoton href="/login">
            Abrir prototipo <ArrowRight aria-hidden />
          </EnlaceBoton>
        </div>
      </div>
      <nav aria-label="Secciones" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
        {SECCIONES.map((seccion) => (
          <a key={seccion.id} href={`#${seccion.id}`} className="shrink-0 rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            {seccion.titulo}
          </a>
        ))}
      </nav>
    </header>

    <main className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">Parcial I · Ingeniería de Software II · Uniremington</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">Prototipo UI/UX y estrategia ágil de la plataforma de agendamiento</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Documento vivo del prototipo: pantallas, decisiones de diseño, Product Backlog y planificación de sprints con Scrum.
        </p>
      </div>

      <Seccion id="vistas" titulo="Vistas del prototipo" descripcion="Las cuatro categorías de pantalla que pide el Anexo 3 y cómo se conectan con la arquitectura de microservicios y eventos.">
        <TablaVistas />
      </Seccion>
      <Seccion id="principios" titulo="Justificación UI/UX" descripcion="Cómo cada principio de diseño de interfaz se materializa en el prototipo.">
        <PrincipiosUx />
      </Seccion>
      <Seccion id="backlog" titulo="Product Backlog" descripcion="Historias de usuario con criterios de aceptación, prioridad y estimación en puntos (criterios INVEST).">
        <TablaBacklog />
      </Seccion>
      <Seccion id="sprints" titulo="Planificación de sprints" descripcion="Tres sprints de dos semanas; cada uno entrega un incremento de software funcional y demostrable.">
        <PlanSprints />
      </Seccion>
      <Seccion id="scrum" titulo="Marco Scrum" descripcion="Roles, eventos y acuerdos de calidad del equipo.">
        <MarcoScrum />
      </Seccion>
      <Seccion id="sustentacion" titulo="Puntos clave de la sustentación" descripcion="Guion resumido de la presentación ejecutiva.">
        <ol className="list-decimal space-y-2 pl-6 text-base">
          {PUNTOS_SUSTENTACION.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ol>
      </Seccion>
    </main>
  </div>
);
