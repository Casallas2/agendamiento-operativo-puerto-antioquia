import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from 'src/common/decorators';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { FlotaService } from './flota.service';
import type { ConductoresResponse, VehiculosResponse } from './types';

@ApiTags('Flota')
@ApiBearerAuth('cookie-auth')
@Controller('fleet')
export class FlotaController {
  constructor(private readonly flotaService: FlotaService) {}

  @Get('vehicles')
  @ApiOperation({
    summary: 'Listar vehículos visibles',
    description: 'Filtrado por empresa según el rol del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehículos obtenidos',
    schema: {
      example: {
        status: 200,
        message: 'Vehículos obtenidos',
        data: [
          {
            id: 'uuid-here',
            placa: 'TTK-482',
            tipo: 'Tractocamion refrigerado',
            marca: 'Kenworth T800',
            empresaId: 'uuid-here',
            estadoRunt: 'ACTIVO',
            vencimientoSoat: '2027-04-17T00:00:00.000Z',
            vencimientoTecnomecanica: '2026-12-23T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async obtenerVehiculos(@UsuarioActual() usuario: UsuarioSesion): Promise<VehiculosResponse> {
    return this.flotaService.obtenerVehiculos(usuario);
  }

  @Get('drivers')
  @ApiOperation({
    summary: 'Listar conductores visibles',
    description: 'El conductor solo ve su propia ficha; el transportista, la de su empresa',
  })
  @ApiResponse({ status: 200, description: 'Conductores obtenidos' })
  async obtenerConductores(@UsuarioActual() usuario: UsuarioSesion): Promise<ConductoresResponse> {
    return this.flotaService.obtenerConductores(usuario);
  }
}
