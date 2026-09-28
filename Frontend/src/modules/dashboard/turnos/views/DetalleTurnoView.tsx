'use client';

import { AlertTriangle, ArrowLeft, CalendarPlus, SearchX, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EnlaceBoton } from '@/components/shared/EnlaceBoton';
import { EstadoVacio } from '@/components/shared/EstadoVacio';
import { InsigniaEstadoTurno } from '@/components/shared/InsigniaEstado';
import { ETIQUETAS_OPERACION } from '@/core/config/catalogos';
import { useAuthStore } from '@/core/store/authStore';
import { formatearDiaRelativo, formatearVentana } from '@/lib/formatos';
import { HistorialTurno } from '../components/HistorialTurno';
import { LineaValidacion } from '../components/LineaValidacion';
import { useCancelarTurno } from '../hooks/useCancelarTurno';
import { useGetTurno } from '../hooks/useTurnos';

const DatoTurno = ({ etiqueta, valor, esCodigo }: { etiqueta: string; valor: string; esCodigo?: boolean }) => (
  <div className="space-y-0.5">
    <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
    <dd className={esCodigo ? 'font-mono text-sm font-medium' : 'text-sm font-medium'}>{valor}</dd>
  </div>
);

export const DetalleTurnoView = ({ turnoId }: { turnoId: string }) => {
  const usuario = useAuthStore((estado) => estado.user);
  const { data: turno, isLoading, isError } = useGetTurno(turnoId);
  const { solicitarCancelacion, estaCancelando } = useCancelarTurno();

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }
  if (isError || !turno) {
    return (
      <EstadoVacio
        Icono={SearchX}
        titulo="No encontramos este turno"
        descripcion="Puede que no exista o que pertenezca a otra empresa."
        accion={<EnlaceBoton href="/dashboard/turnos" variant="outline">Volver a turnos</EnlaceBoton>}
      />
    );
  }

  const esTransportista = usuario?.rol === 'TRANSPORTISTA';
  const puedeCancelar = esTransportista && (turno.estado === 'CONFIRMADO' || turno.estado === 'PENDIENTE_VALIDACION');

  return (
    <>
      <EnlaceBoton href="/dashboard/turnos" variant="ghost" size="sm" className="w-fit">
        <ArrowLeft aria-hidden />
        Volver a turnos
      </EnlaceBoton>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold">{turno.codigo}</h1>
            <InsigniaEstadoTurno estado={turno.estado} tamano="grande" />
          </div>
          <p className="text-muted-foreground">
            {formatearDiaRelativo(turno.inicio)} · {formatearVentana(turno.inicio, turno.fin, turno.retrasoMinutos)} · {turno.nombreMuelle}
          </p>
        </div>
        {puedeCancelar && (
          <Button variant="destructive" size="lg" onClick={() => solicitarCancelacion(turno)} disabled={estaCancelando}>
            <XCircle aria-hidden />
            Cancelar turno
          </Button>
        )}
      </div>

      {turno.estado === 'RECHAZADO' && (
        <Alert variant="destructive">
          <XCircle aria-hidden />
          <AlertTitle>Turno rechazado por documentación</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{turno.motivoRechazo}. El cupo fue liberado.</p>
            {esTransportista && (
              <EnlaceBoton href="/dashboard/turnos/nuevo" size="sm" variant="outline">
                <CalendarPlus aria-hidden />
                Corregir y agendar de nuevo
              </EnlaceBoton>
            )}
          </AlertDescription>
        </Alert>
      )}
      {turno.retrasoMinutos > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="text-amber-600" aria-hidden />
          <AlertTitle>Ventana desplazada {turno.retrasoMinutos} minutos</AlertTitle>
          <AlertDescription>El muelle reportó un retraso. La nueva ventana ya se refleja arriba.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <LineaValidacion validaciones={turno.validaciones} />
          <Card>
            <CardHeader>
              <CardTitle>Datos del turno</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <DatoTurno etiqueta="Empresa" valor={turno.nombreEmpresa} />
                <DatoTurno etiqueta="Vehículo" valor={turno.placa} esCodigo />
                <DatoTurno etiqueta="Conductor" valor={turno.nombreConductor} />
                <DatoTurno etiqueta="Operación" valor={ETIQUETAS_OPERACION[turno.tipoOperacion]} />
                <DatoTurno etiqueta="Carga" valor={turno.tipoCarga} />
                <DatoTurno etiqueta="Muelle" valor={turno.nombreMuelle} />
                <DatoTurno etiqueta="Manifiesto" valor={turno.numeroManifiesto} esCodigo />
                <DatoTurno etiqueta="BL" valor={turno.numeroBl} esCodigo />
                {turno.observaciones && (
                  <div className="col-span-full">
                    <DatoTurno etiqueta="Observaciones para el operador" valor={turno.observaciones} />
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
        <HistorialTurno historial={turno.historial} />
      </div>
    </>
  );
};
