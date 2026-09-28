import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { CookieOptions } from 'express';
import { obtenerAreaPorRol, obtenerCookiePorRol } from 'src/common/constants/sesion.constants';
import { construirRespuesta, construirRespuestaVacia } from 'src/common/types/respuesta-api.type';
import type { PayloadJwt, UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { UsersService } from 'src/modules/users/users.service';
import type { LoginDto, VerificarMfaDto } from './dto';
import { MfaService } from './mfa.service';
import { obtenerSegundosSesion } from './sesion.constants';
import type { CierreSesionResponse, DesafioMfaResponse, SesionResponse } from './types';

/** Resultado interno: el controlador es quien escribe la cookie en la respuesta HTTP */
export type SesionEmitida = {
  respuesta: SesionResponse;
  cookie: { nombre: string; valor: string; opciones: CookieOptions };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mfaService: MfaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /** Paso 1: valida credenciales y emite el desafío de segundo factor */
  async iniciarSesion(credenciales: LoginDto): Promise<DesafioMfaResponse> {
    const usuario = await this.usersService.buscarPorCorreoConPassword(credenciales.correo);
    const contrasenaValida =
      usuario && (await bcrypt.compare(credenciales.contrasena, usuario.passwordHash));

    // Mismo mensaje para usuario inexistente y contraseña errada: no se filtra qué correos existen
    if (!usuario || !contrasenaValida) {
      this.logger.warn(`Intento de acceso fallido para ${credenciales.correo}`);
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const desafio = await this.mfaService.emitirDesafio(usuario.id);

    return construirRespuesta(200, 'Código de verificación enviado', {
      desafioId: desafio.id,
      telefonoEnmascarado: MfaService.enmascararTelefono(usuario.telefono),
      nombreUsuario: usuario.nombre,
    });
  }

  /** Paso 2: verifica el código y emite el JWT dentro de una cookie httpOnly */
  async verificarMfa(payload: VerificarMfaDto): Promise<SesionEmitida> {
    const usuarioId = await this.mfaService.verificarDesafio(payload.desafioId, payload.codigo);

    const usuario = await this.usersService.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Tu sesión expiró. Inicia sesión de nuevo.');
    }

    const sesion = UsersService.aUsuarioSesion(usuario);
    const contenido: PayloadJwt = {
      sub: sesion.id,
      correo: sesion.correo,
      rol: sesion.rol,
      area: obtenerAreaPorRol(sesion.rol),
    };
    const token = await this.jwtService.signAsync(contenido);

    this.logger.log(`Sesión iniciada: ${sesion.correo} (${sesion.rol})`);

    return {
      respuesta: construirRespuesta(200, 'Sesión iniciada', sesion),
      cookie: {
        nombre: obtenerCookiePorRol(sesion.rol),
        valor: token,
        opciones: this.opcionesCookie(),
      },
    };
  }

  obtenerPerfil(usuario: UsuarioSesion): SesionResponse {
    return construirRespuesta(200, 'Perfil obtenido', usuario);
  }

  cerrarSesion(): CierreSesionResponse {
    return construirRespuestaVacia(200, 'Sesión cerrada');
  }

  /** Nombres de cookie que el cierre de sesión debe limpiar */
  obtenerCookiesDeSesion(): string[] {
    return [obtenerCookiePorRol('CONDUCTOR'), obtenerCookiePorRol('TRANSPORTISTA')];
  }

  /**
   * httpOnly impide que un XSS lea el token; sameSite `lax` permite que el portal Next.js
   * (otro puerto en desarrollo) envíe la cookie con `withCredentials`.
   */
  opcionesCookie(): CookieOptions {
    const esProduccion = this.configService.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: esProduccion,
      sameSite: esProduccion ? 'strict' : 'lax',
      // La cookie caduca junto con el JWT que transporta
      maxAge: obtenerSegundosSesion(this.configService) * 1000,
      path: '/',
    };
  }
}
