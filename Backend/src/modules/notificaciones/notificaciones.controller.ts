import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from 'src/common/decorators';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { NotificacionesService } from './notificaciones.service';
import type { NotificacionesLeidasResponse, NotificacionesResponse } from './types';

@ApiTags('Notificaciones')
@ApiBearerAuth('cookie-auth')
@Controller('notifications')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificaciones del usuario',
    description: 'Devuelve las 30 notificaciones más recientes del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones obtenidas',
    schema: {
      example: {
        status: 200,
        message: 'Notificaciones obtenidas',
        data: [
          {
            id: 'uuid-here',
            usuarioId: 'uuid-here',
            titulo: 'Turno confirmado',
            mensaje: 'Tu turno TRN-1001 en Muelle 2 fue confirmado.',
            tipo: 'EXITO',
            canales: ['PUSH', 'VOZ'],
            turnoId: 'uuid-here',
            leida: false,
            creadaEn: '2026-09-19T12:00:00.000Z',
          },
        ],
      },
    },
  })
  async obtener(@UsuarioActual() usuario: UsuarioSesion): Promise<NotificacionesResponse> {
    return this.notificacionesService.obtenerDeUsuario(usuario);
  }

  @Post('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas como leídas' })
  async marcarLeidas(@UsuarioActual() usuario: UsuarioSesion): Promise<NotificacionesLeidasResponse> {
    return this.notificacionesService.marcarTodasLeidas(usuario);
  }
}
