'use client';

import { ChartColumn, Table as TableIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { OcupacionFranja, PuntoEsperaGrafico, RechazoPorMotivo } from '../types/alertas.types';

const ESTILO_EJE = { fontSize: 12, fill: 'var(--muted-foreground)' };
const ESTILO_TOOLTIP = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
};

interface TarjetaGraficoProps {
  titulo: string;
  descripcion: string;
  children: ReactNode;
  filasTabla: [string, string][];
  encabezados: [string, string];
}

/** Cada gráfico incluye su tabla de datos: la información nunca depende solo del color o la forma */
const TarjetaGrafico = ({ titulo, descripcion, children, filasTabla, encabezados }: TarjetaGraficoProps) => (
  <Card>
    <Tabs defaultValue="grafico" className="gap-0">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
        <CardAction>
          <TabsList aria-label={`Formato de ${titulo}`}>
            <TabsTrigger value="grafico" aria-label="Ver gráfico">
              <ChartColumn aria-hidden />
            </TabsTrigger>
            <TabsTrigger value="tabla" aria-label="Ver datos en tabla">
              <TableIcon aria-hidden />
            </TabsTrigger>
          </TabsList>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-3">
        <TabsContent value="grafico" className="h-64 w-full">
          {children}
        </TabsContent>
        <TabsContent value="tabla" className="h-64 overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{encabezados[0]}</TableHead>
                <TableHead className="text-right">{encabezados[1]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filasTabla.map(([etiqueta, valor]) => (
                <TableRow key={etiqueta}>
                  <TableCell>{etiqueta}</TableCell>
                  <TableCell className="text-right tabular-nums">{valor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </CardContent>
    </Tabs>
  </Card>
);

export const GraficoOcupacion = ({ datos }: { datos: OcupacionFranja[] }) => (
  <TarjetaGrafico
    titulo="Cupos reservados por franja (hoy)"
    descripcion="Suma de todos los muelles. Ayuda a distribuir la llegada de camiones."
    encabezados={['Franja', 'Reservados / capacidad']}
    filasTabla={datos.map((dato) => [dato.franja, `${dato.ocupados} / ${dato.capacidad}`])}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="franja" tick={ESTILO_EJE} axisLine={false} tickLine={false} />
        <YAxis tick={ESTILO_EJE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
          contentStyle={ESTILO_TOOLTIP}
          formatter={(valor, _nombre, elemento) => [`${valor} de ${(elemento.payload as OcupacionFranja).capacidad}`, 'Cupos reservados']}
        />
        <Bar dataKey="ocupados" name="Cupos reservados" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  </TarjetaGrafico>
);

export const GraficoEspera = ({ datos }: { datos: PuntoEsperaGrafico[] }) => (
  <TarjetaGrafico
    titulo="Tiempo promedio de espera en vía"
    descripcion="Minutos que un camión espera para ingresar, desde la adopción del agendamiento."
    encabezados={['Día', 'Minutos']}
    filasTabla={datos.map((dato) => [dato.dia, `${dato.minutos} min`])}
  >
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={datos} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="dia" tick={ESTILO_EJE} axisLine={false} tickLine={false} />
        <YAxis tick={ESTILO_EJE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={(valor) => [`${valor} min`, 'Espera promedio']} />
        <Line
          type="monotone"
          dataKey="minutos"
          name="Espera promedio"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </TarjetaGrafico>
);

export const GraficoRechazos = ({ datos }: { datos: RechazoPorMotivo[] }) => (
  <TarjetaGrafico
    titulo="Rechazos por tipo de documento"
    descripcion="Qué documentos fallan más en la validación automática."
    encabezados={['Documento', 'Rechazos']}
    filasTabla={datos.map((dato) => [dato.motivo, String(dato.cantidad)])}
  >
    {datos.length === 0 ? (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin rechazos registrados.</div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" tick={ESTILO_EJE} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="motivo" tick={ESTILO_EJE} axisLine={false} tickLine={false} width={150} />
          <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.6 }} contentStyle={ESTILO_TOOLTIP} formatter={(valor) => [valor, 'Rechazos']} />
          <Bar dataKey="cantidad" name="Rechazos" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </TarjetaGrafico>
);
