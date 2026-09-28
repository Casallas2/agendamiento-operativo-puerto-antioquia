import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PRINCIPIOS_UX, VISTAS_PROTOTIPO } from '../data/disenoUx';

export const TablaVistas = () => (
  <div className="rounded-xl border">
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow className="bg-muted/60">
          <TableHead className="px-4">Vista</TableHead>
          <TableHead className="px-4">Categoría (Anexo 3)</TableHead>
          <TableHead className="px-4">Usuario</TableHead>
          <TableHead className="px-4">Microservicios</TableHead>
          <TableHead className="px-4">Eventos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {VISTAS_PROTOTIPO.map((vista) => (
          <TableRow key={vista.ruta} className="align-top">
            <TableCell className="px-4 py-3">
              <Link href={vista.ruta} className="flex items-center gap-1 font-medium text-primary hover:underline">
                {vista.nombre}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
              <span className="font-mono text-xs text-muted-foreground">{vista.ruta}</span>
            </TableCell>
            <TableCell className="px-4 py-3 whitespace-normal">
              <Badge variant="secondary">{vista.categoria}</Badge>
            </TableCell>
            <TableCell className="px-4 py-3 whitespace-normal">{vista.rol}</TableCell>
            <TableCell className="px-4 py-3 whitespace-normal text-muted-foreground">{vista.microservicios}</TableCell>
            <TableCell className="px-4 py-3 font-mono text-xs whitespace-normal text-muted-foreground">{vista.eventos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export const PrincipiosUx = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {PRINCIPIOS_UX.map((principio) => (
      <Card key={principio.principio}>
        <CardHeader>
          <CardTitle>{principio.principio}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{principio.aplicacion}</p>
          <p className="rounded-lg bg-muted/60 p-3 text-muted-foreground">
            <strong className="text-foreground">En el prototipo: </strong>
            {principio.evidencia}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
