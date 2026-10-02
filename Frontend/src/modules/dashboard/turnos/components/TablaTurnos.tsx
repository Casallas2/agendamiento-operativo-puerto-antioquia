'use client';

import { AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { InsigniaCargaRefrigerada, InsigniaEstadoTurno } from '@/components/shared/InsigniaEstado';
import { formatearDiaRelativo, formatearVentana } from '@/lib/formatos';
import type { TurnoDetallado } from '../types/turnos.types';
import { MenuAccionesTurno } from './MenuAccionesTurno';

interface TablaTurnosProps {
  turnos: TurnoDetallado[];
  puedeCancelar: boolean;
  mostrarEmpresa: boolean;
  alCancelar: (turno: TurnoDetallado) => void;
}

const VentanaTurno = ({ turno }: { turno: TurnoDetallado }) => (
  <div className="space-y-0.5">
    <p className="font-medium">{formatearDiaRelativo(turno.inicio)}</p>
    <p className="text-xs text-muted-foreground tabular-nums">{formatearVentana(turno.inicio, turno.fin, turno.retrasoMinutos)}</p>
    {turno.retrasoMinutos > 0 && (
      <p className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-warning">
        <AlertTriangle className="size-3" aria-hidden />+{turno.retrasoMinutos} min
      </p>
    )}
  </div>
);

export const TablaTurnos = ({ turnos, puedeCancelar, mostrarEmpresa, alCancelar }: TablaTurnosProps) => (
  <>
    <div className="hidden overflow-hidden rounded-xl border md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Turno</TableHead>
            <TableHead>Ventana</TableHead>
            <TableHead>Vehículo y conductor</TableHead>
            <TableHead>Muelle</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {turnos.map((turno) => (
            <TableRow key={turno.id}>
              <TableCell>
                <p className="font-mono font-medium">{turno.codigo}</p>
                <p className="text-xs text-muted-foreground">{mostrarEmpresa ? turno.nombreEmpresa : turno.tipoCarga}</p>
              </TableCell>
              <TableCell>
                <VentanaTurno turno={turno} />
              </TableCell>
              <TableCell>
                <p className="font-mono font-medium">{turno.placa}</p>
                <p className="text-xs text-muted-foreground">{turno.nombreConductor}</p>
              </TableCell>
              <TableCell>{turno.nombreMuelle}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <InsigniaEstadoTurno estado={turno.estado} />
                  {turno.cargaRefrigerada && <InsigniaCargaRefrigerada />}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <EnlaceBoton variant="outline" size="sm" href={`/dashboard/turnos/${turno.id}`}>
                    Ver detalle
                  </EnlaceBoton>
                  <MenuAccionesTurno turno={turno} puedeCancelar={puedeCancelar} alCancelar={alCancelar} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <ul className="space-y-3 md:hidden">
      {turnos.map((turno) => (
        <li key={turno.id}>
          <Link href={`/dashboard/turnos/${turno.id}`} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-medium">{turno.codigo}</span>
                <InsigniaEstadoTurno estado={turno.estado} />
              </div>
              <VentanaTurno turno={turno} />
              {turno.cargaRefrigerada && <InsigniaCargaRefrigerada />}
              <p className="text-xs text-muted-foreground">
                {turno.placa} · {turno.nombreConductor} · {turno.nombreMuelle}
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  </>
);
