import { Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import { construirRespuestaVacia, type RespuestaApi } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { SemillaService } from 'src/shared/database/seeds/semilla.service';

@ApiTags('Demostración')
@ApiBearerAuth('cookie-auth')
@Controller('demo')
@UseGuards(RolesGuard)
export class DemoController {
  private readonly logger = new Logger(DemoController.name);

  constructor(private readonly semillaService: SemillaService) {}

  @Post('reset')
  @HttpCode(200)
  @Roles('OPERADOR_PORTUARIO', 'TRANSPORTISTA')
  @ApiOperation({
    summary: 'Restaurar los datos de demostración',
    description:
      'Borra turnos y notificaciones creados durante la sesión y vuelve a sembrar el estado ' +
      'inicial. Pensado para dejar la demostración limpia antes de una sustentación.',
  })
  @ApiResponse({ status: 200, description: 'Datos de demostración restaurados' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para realizar esta acción' })
  async reiniciar(@UsuarioActual() usuario: UsuarioSesion): Promise<RespuestaApi> {
    await this.semillaService.ejecutar();
    this.logger.warn(`Datos de demostración restaurados por ${usuario.correo}`);
    return construirRespuestaVacia(200, 'Datos de demostración restaurados');
  }
}
