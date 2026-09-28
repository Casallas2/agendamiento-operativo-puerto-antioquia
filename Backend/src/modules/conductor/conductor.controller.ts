import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import type { TurnoResponse } from 'src/modules/turnos/types';
import { ConductorService } from './conductor.service';
import { ReportarNovedadDto } from './dto';
import type { ResumenConductorResponse } from './types';

@ApiTags('Cabina del conductor')
@ApiBearerAuth('cookie-auth')
@Controller('driver')
@UseGuards(RolesGuard)
@Roles('CONDUCTOR')
export class ConductorController {
  constructor(private readonly conductorService: ConductorService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen de cabina',
    description: 'Turno actual, vehículo asignado, muelle destino y próximos turnos del conductor',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen obtenido',
    schema: {
      example: {
        status: 200,
        message: 'Resumen obtenido',
        data: {
          conductor: { id: 'uuid-here', nombre: 'Carlos Mena', categoriaLicencia: 'C3' },
          vehiculo: { id: 'uuid-here', placa: 'TTK-482' },
          muelle: { id: 'uuid-here', nombre: 'Muelle 2', estado: 'OPERATIVO' },
          turnoActual: { id: 'uuid-here', codigo: 'TRN-1001', estado: 'CONFIRMADO' },
          proximosTurnos: [],
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Esta vista es exclusiva para conductores' })
  async obtenerResumen(@UsuarioActual() usuario: UsuarioSesion): Promise<ResumenConductorResponse> {
    return this.conductorService.obtenerResumen(usuario);
  }

  @Post('bookings/:id/on-route')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Avisar que el conductor va en camino',
    description: 'Cambia el turno a EN_CAMINO y notifica al transportista y al puerto',
  })
  @ApiParam({ name: 'id', description: 'Identificador del turno' })
  @ApiResponse({ status: 200, description: 'Viaje iniciado' })
  @ApiResponse({ status: 409, description: 'Solo puedes iniciar viaje con un turno confirmado' })
  async marcarEnCamino(
    @UsuarioActual() usuario: UsuarioSesion,
    @Param('id', ParseUUIDPipe) turnoId: string,
  ): Promise<TurnoResponse> {
    return this.conductorService.marcarEnCamino(usuario, turnoId);
  }

  @Post('bookings/:id/incident')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reportar una novedad en ruta',
    description: 'Registra la novedad en el historial del turno y avisa por los canales configurados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del turno' })
  @ApiResponse({ status: 200, description: 'Novedad reportada' })
  @ApiResponse({ status: 404, description: 'No encontramos tu turno' })
  async reportarNovedad(
    @UsuarioActual() usuario: UsuarioSesion,
    @Param('id', ParseUUIDPipe) turnoId: string,
    @Body() payload: ReportarNovedadDto,
  ): Promise<TurnoResponse> {
    return this.conductorService.reportarNovedad(usuario, turnoId, payload);
  }
}
