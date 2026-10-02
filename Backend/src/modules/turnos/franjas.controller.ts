import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConsultarFranjasDto } from './dto';
import { FranjasService } from './franjas.service';
import type { FranjasResponse } from './types';

@ApiTags('Franjas')
@ApiBearerAuth('cookie-auth')
@Controller('slots')
export class FranjasController {
  constructor(private readonly franjasService: FranjasService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar la agenda de un día',
    description: 'Devuelve las franjas de todos los muelles con su ocupación actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Franjas obtenidas',
    schema: {
      example: {
        status: 200,
        message: 'Franjas obtenidas',
        data: [
          {
            id: 'uuid-here',
            muelleId: 'uuid-here',
            inicio: '2026-09-19T11:00:00.000Z',
            fin: '2026-09-19T13:00:00.000Z',
            capacidad: 8,
            ocupados: 3,
            cupoPrioritario: 2,
            ocupadosRefrigerados: 1,
            disponibles: { general: 4, refrigerada: 5 },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'La fecha debe tener el formato AAAA-MM-DD' })
  async obtener(@Query() filtro: ConsultarFranjasDto): Promise<FranjasResponse> {
    return this.franjasService.obtenerPorFecha(filtro.fecha);
  }
}
