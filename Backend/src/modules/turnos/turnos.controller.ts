import {
  Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { CrearTurnoDto, FiltroTurnosDto } from './dto';
import { TurnosConsultaService } from './turnos-consulta.service';
import { TurnosService } from './turnos.service';
import type { TurnoResponse, TurnosResponse } from './types';

@ApiTags('Turnos')
@ApiBearerAuth('cookie-auth')
@Controller('bookings')
@UseGuards(RolesGuard)
export class TurnosController {
  constructor(
    private readonly turnosService: TurnosService,
    private readonly consultaService: TurnosConsultaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar turnos visibles',
    description:
      'El operador portuario ve todos los turnos; el transportista los de su empresa; ' +
      'el conductor únicamente los suyos',
  })
  @ApiResponse({
    status: 200,
    description: 'Turnos obtenidos exitosamente',
    schema: {
      example: {
        status: 200,
        message: 'Turnos obtenidos exitosamente',
        data: [
          {
            id: 'uuid-here',
            codigo: 'TRN-1001',
            estado: 'CONFIRMADO',
            inicio: '2026-09-19T11:00:00.000Z',
            fin: '2026-09-19T13:00:00.000Z',
            tipoOperacion: 'EXPORTACION',
            tipoCarga: 'Refrigerated banana',
            numeroManifiesto: 'MAN-2026-004512',
            numeroBl: 'BL-PA-88213',
            cargaRefrigerada: true,
            numeroCertificadoIca: 'CFE-2026-001204',
            retrasoMinutos: 0,
            placa: 'TTK-482',
            nombreConductor: 'Carlos Mena',
            nombreMuelle: 'Muelle 2',
            nombreEmpresa: 'Transportes Uraba S.A.S.',
            validaciones: [],
            historial: [],
            creadoEn: '2026-09-18T15:00:00.000Z',
          },
        ],
      },
    },
  })
  async obtenerTurnos(
    @UsuarioActual() usuario: UsuarioSesion,
    @Query() filtro: FiltroTurnosDto,
  ): Promise<TurnosResponse> {
    return this.consultaService.obtenerTurnos(usuario, filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un turno' })
  @ApiParam({ name: 'id', description: 'Identificador del turno' })
  @ApiResponse({ status: 200, description: 'Turno obtenido' })
  @ApiResponse({ status: 404, description: 'El turno no existe o no tienes acceso a él' })
  async obtenerTurno(
    @UsuarioActual() usuario: UsuarioSesion,
    @Param('id', ParseUUIDPipe) turnoId: string,
  ): Promise<TurnoResponse> {
    return this.consultaService.obtenerTurno(usuario, turnoId);
  }

  @Post()
  @HttpCode(202)
  @Roles('TRANSPORTISTA')
  @ApiOperation({
    summary: 'Reservar un turno',
    description:
      'Responde 202 Accepted (RF-01): el cupo queda apartado de inmediato y la validación ' +
      'documental continúa de forma asíncrona tras el evento TurnoSolicitado',
  })
  @ApiBody({
    type: CrearTurnoDto,
    examples: {
      exportacion: {
        summary: 'Exportación de banano refrigerado (cuota prioritaria + ICA)',
        value: {
          vehiculoId: 'uuid-here',
          conductorId: 'uuid-here',
          tipoOperacion: 'EXPORTACION',
          tipoCarga: 'Refrigerated banana',
          cargaRefrigerada: true,
          numeroCertificadoIca: 'CFE-2026-001204',
          numeroManifiesto: 'MAN-2026-004512',
          numeroBl: 'BL-PA-88213',
          franjaId: 'uuid-here',
        },
      },
      cargaGeneral: {
        summary: 'Carga general (no puede usar la cuota prioritaria)',
        value: {
          vehiculoId: 'uuid-here',
          conductorId: 'uuid-here',
          tipoOperacion: 'EXPORTACION',
          tipoCarga: 'General cargo',
          numeroManifiesto: 'MAN-2026-004530',
          numeroBl: 'BL-PA-88240',
          franjaId: 'uuid-here',
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: 'Solicitud de turno recibida' })
  @ApiResponse({ status: 403, description: 'Solo los transportistas pueden reservar turnos' })
  @ApiResponse({ status: 404, description: 'La franja seleccionada ya no existe' })
  @ApiResponse({ status: 409, description: 'La franja se llenó, solo quedan cupos de la cuota refrigerada, el muelle está en mantenimiento o el vehículo ya tiene turno' })
  async crearTurno(
    @UsuarioActual() usuario: UsuarioSesion,
    @Body() payload: CrearTurnoDto,
  ): Promise<TurnoResponse> {
    return this.turnosService.crearTurno(usuario, payload);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @Roles('TRANSPORTISTA', 'OPERADOR_PORTUARIO')
  @ApiOperation({
    summary: 'Cancelar un turno',
    description: 'Libera el cupo de la franja y notifica al conductor asignado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del turno' })
  @ApiResponse({ status: 200, description: 'Turno cancelado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para cancelar este turno' })
  @ApiResponse({ status: 409, description: 'El turno no está en un estado cancelable' })
  async cancelarTurno(
    @UsuarioActual() usuario: UsuarioSesion,
    @Param('id', ParseUUIDPipe) turnoId: string,
  ): Promise<TurnoResponse> {
    return this.turnosService.cancelarTurno(usuario, turnoId);
  }
}
