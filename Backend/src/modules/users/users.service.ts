import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { Usuario } from './entities';
import type { DestinatariosTurno } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /** Nunca expone la contraseña fuera de la capa de datos */
  static aUsuarioSesion(usuario: Usuario): UsuarioSesion {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      telefono: usuario.telefono,
      empresaId: usuario.empresaId ?? undefined,
      empresaNombre: usuario.empresaNombre ?? undefined,
      conductorId: usuario.conductorId ?? undefined,
    };
  }

  async buscarSesionPorId(id: string): Promise<UsuarioSesion | null> {
    const usuario = await this.usuarioRepository.findOne({ where: { id, isActive: true } });
    return usuario ? UsersService.aUsuarioSesion(usuario) : null;
  }

  /** Incluye el hash de la contraseña: úsese solo en el flujo de autenticación */
  async buscarPorCorreoConPassword(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('LOWER(usuario.correo) = LOWER(:correo)', { correo: correo.trim() })
      .andWhere('usuario.isActive = true')
      .getOne();
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id, isActive: true } });
  }

  /**
   * Destinatarios de un evento de turno: el conductor asignado, el transportista dueño
   * de la carga y, opcionalmente, los operadores del puerto.
   */
  async obtenerInteresadosEnTurno(
    { conductorId, empresaId }: DestinatariosTurno,
    incluirOperador = true,
  ): Promise<string[]> {
    const consulta = this.usuarioRepository
      .createQueryBuilder('usuario')
      .select('usuario.id', 'id')
      .where('usuario.isActive = true')
      .andWhere(
        `(
          (usuario.rol = 'CONDUCTOR' AND usuario.conductor_id = :conductorId)
          OR (usuario.rol = 'TRANSPORTISTA' AND usuario.empresa_id = :empresaId)
          ${incluirOperador ? "OR usuario.rol = 'OPERADOR_PORTUARIO'" : ''}
        )`,
        { conductorId, empresaId },
      );

    const filas = await consulta.getRawMany<{ id: string }>();
    return filas.map((fila) => fila.id);
  }
}
