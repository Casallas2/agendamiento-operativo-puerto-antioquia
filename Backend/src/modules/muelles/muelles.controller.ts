import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import { UseGuards } from '@nestjs/common';
import { DeclararRetrasoDto } from './dto';
import { MuellesService } from './muelles.service';
import type { MuelleResponse, MuellesResponse, TurnosNotificadosResponse } from './types';

@ApiTags('Muelles')
@ApiBearerAuth('cookie-auth')
@Controller('docks')
@UseGuards(RolesGuard)
export class MuellesController {
  constructor(private readonly muellesService: MuellesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar muelles', description: 'Estado y capacidad de todos los muelles' })
  @ApiResponse({
    status: 200,
    description: 'Muelles obtenidos',
    schema: {
      example: {
        status: 200,
        message: 'Muelles obtenidos',
        data: [
          {
            id: 'uuid-here',
            nombre: 'Muelle 2',
            tipoCarga: 'Banano refrigerado',
            estado: 'OPERATIVO',
            retrasoMinutos: 0,
            capacidadPorFranja: 8,
          },
        ],
      },
    },
  })
  async obtener(): Promise<MuellesResponse> {
    return this.muellesService.obtenerMuelles();
  }

  @Post(':id/delay')
  @HttpCode(200)
  @Roles('OPERADOR_PORTUARIO')
  @ApiOperation({
    summary: 'Declarar un retraso en el muelle',
    description: 'Desplaza la ventana de los turnos próximos y notifica a conductores y transportistas',
  })
  @ApiParam({ name: 'id', description: 'Identificador del muelle' })
  @ApiResponse({
    status: 200,
    description: 'Retraso declarado y notificado',
    schema: { example: { status: 200, message: 'Retraso declarado y notificado', data: 3 } },
  })
  @ApiResponse({ status: 403, description: 'Solo el operador portuario puede gestionar muelles' })
  @ApiResponse({ status: 404, description: 'El muelle no existe' })
  async declararRetraso(
    @Param('id', ParseUUIDPipe) muelleId: string,
    @Body() payload: DeclararRetrasoDto,
  ): Promise<TurnosNotificadosResponse> {
    return this.muellesService.declararRetraso(muelleId, payload);
  }

  @Post(':id/restore')
  @HttpCode(200)
  @Roles('OPERADOR_PORTUARIO')
  @ApiOperation({ summary: 'Restablecer la operación normal del muelle' })
  @ApiParam({ name: 'id', description: 'Identificador del muelle' })
  @ApiResponse({ status: 200, description: 'Operación restablecida' })
  async restablecer(@Param('id', ParseUUIDPipe) muelleId: string): Promise<TurnosNotificadosResponse> {
    return this.muellesService.restablecerOperacion(muelleId);
  }

  @Post(':id/maintenance')
  @HttpCode(200)
  @Roles('OPERADOR_PORTUARIO')
  @ApiOperation({
    summary: 'Alternar el mantenimiento del muelle',
    description: 'Un muelle en mantenimiento deja de aceptar nuevas reservas',
  })
  @ApiParam({ name: 'id', description: 'Identificador del muelle' })
  @ApiResponse({ status: 200, description: 'Estado del muelle actualizado' })
  async alternarMantenimiento(@Param('id', ParseUUIDPipe) muelleId: string): Promise<MuelleResponse> {
    return this.muellesService.alternarMantenimiento(muelleId);
  }
}
