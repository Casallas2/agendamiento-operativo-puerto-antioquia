import type { RespuestaApiConDatos } from 'src/common/types/respuesta-api.type';
import type { ConductorData, VehiculoData } from 'src/modules/flota/types';
import type { MuelleData } from 'src/modules/muelles/types';
import type { TurnoDetalladoData } from 'src/modules/turnos/types';

/** Espejo de `ResumenConductor` en el frontend */
export type ResumenConductorData = {
  conductor: ConductorData;
  vehiculo: VehiculoData | null;
  muelle: MuelleData | null;
  turnoActual: TurnoDetalladoData | null;
  proximosTurnos: TurnoDetalladoData[];
};

export type ResumenConductorResponse = RespuestaApiConDatos<ResumenConductorData>;
