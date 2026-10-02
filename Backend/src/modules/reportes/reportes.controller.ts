import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from 'src/common/decorators';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { ReportesService } from './reportes.service';
import type { ReporteResponse } from './types';

@ApiTags('Reportes')
@ApiBearerAuth('cookie-auth')
@Controller('reports')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('operation')
  @ApiOperation({
    summary: 'Reporte de operación',
    description: 'Indicadores, ocupación por franja, motivos de rechazo e histórico de espera',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado',
    schema: {
      example: {
        status: 200,
        message: 'Reporte generado',
        data: {
          indicadores: {
            turnosHoy: 3,
            turnosConfirmadosHoy: 2,
            turnosEnValidacion: 1,
            vehiculosEnCamino: 1,
            tasaRechazoDocumental: 17,
            muellesConNovedad: 1,
            esperaPromedioMinutos: 84,
            reduccionEsperaPorcentaje: 73,
            turnosRefrigeradosHoy: 4,
            usoCuotaPrioritaria: 58,
          },
          ocupacionPorFranja: [{ franja: '06:00', ocupados: 9, capacidad: 23 }],
          rechazosPorMotivo: [{ motivo: 'Manifiesto de carga', cantidad: 1 }],
          historialEspera: [{ dia: '10 sep', minutos: 312 }],
        },
      },
    },
  })
  async obtenerReporte(@UsuarioActual() usuario: UsuarioSesion): Promise<ReporteResponse> {
    return this.reportesService.obtenerReporte(usuario);
  }
}
