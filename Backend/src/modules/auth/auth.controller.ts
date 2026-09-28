import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AREAS_SESION, CABECERA_AREA } from 'src/common/constants/sesion.constants';
import { Publico, UsuarioActual } from 'src/common/decorators';
import type { AreaSesion, UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { AuthService } from './auth.service';
import { LoginDto, VerificarMfaDto } from './dto';
import type { CierreSesionResponse, DesafioMfaResponse, SesionResponse } from './types';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  // Freno a la fuerza bruta: 5 intentos por minuto y por IP
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Iniciar sesión con credenciales',
    description: 'Valida correo y contraseña y emite un desafío de segundo factor (RNF-02)',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      transportista: {
        summary: 'Transportista de demostración',
        value: { correo: 'transportista@transuraba.co', contrasena: 'Puerto2026!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Código de verificación enviado',
    schema: {
      example: {
        status: 200,
        message: 'Código de verificación enviado',
        data: {
          desafioId: 'uuid-here',
          telefonoEnmascarado: '+57 *** *** 2290',
          nombreUsuario: 'Andres Pineda',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: { example: { status: 401, message: 'Correo o contraseña incorrectos' } },
  })
  async iniciarSesion(@Body() credenciales: LoginDto): Promise<DesafioMfaResponse> {
    return this.authService.iniciarSesion(credenciales);
  }

  @Publico()
  @Post('mfa/verify')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Verificar el código de segundo factor',
    description: 'Si el código es correcto emite el JWT en una cookie httpOnly propia del área',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada',
    schema: {
      example: {
        status: 200,
        message: 'Sesión iniciada',
        data: {
          id: 'uuid-here',
          nombre: 'Andres Pineda',
          correo: 'transportista@transuraba.co',
          rol: 'TRANSPORTISTA',
          telefono: '+57 315 555 2290',
          empresaId: 'uuid-here',
          empresaNombre: 'Transportes Uraba S.A.S.',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código incorrecto o intentos agotados' })
  @ApiResponse({ status: 410, description: 'El desafío expiró' })
  async verificarMfa(
    @Body() payload: VerificarMfaDto,
    @Res({ passthrough: true }) respuesta: Response,
  ): Promise<SesionResponse> {
    const { respuesta: cuerpo, cookie } = await this.authService.verificarMfa(payload);
    respuesta.cookie(cookie.nombre, cookie.valor, cookie.opciones);
    return cuerpo;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Perfil del usuario autenticado',
    description: 'El rol se confirma siempre contra el servidor, nunca contra el almacenamiento del cliente',
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido' })
  @ApiResponse({ status: 401, description: 'Sesión inválida o expirada' })
  obtenerPerfil(@UsuarioActual() usuario: UsuarioSesion): SesionResponse {
    return this.authService.obtenerPerfil(usuario);
  }

  @Publico()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Limpia la cookie del área indicada en `x-area-sesion`. Reason: así cerrar la cabina no ' +
      'derriba la sesión del portal abierta en paralelo durante la demostración.',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  cerrarSesion(
    @Req() peticion: Request,
    @Res({ passthrough: true }) respuesta: Response,
  ): CierreSesionResponse {
    const opciones = { ...this.authService.opcionesCookie(), maxAge: undefined };
    const area = peticion.headers[CABECERA_AREA] as AreaSesion | undefined;
    const cookies = area && AREAS_SESION[area]
      ? [AREAS_SESION[area]]
      : this.authService.obtenerCookiesDeSesion();

    cookies.forEach((nombre) => respuesta.clearCookie(nombre, opciones));
    return this.authService.cerrarSesion();
  }
}
