import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import type { UsuarioSesion } from 'src/common/types/usuario-sesion.type';
import { Conductor, Vehiculo } from './entities';
import { mapearConductor, mapearVehiculo } from './flota.mapper';
import type { ConductoresResponse, VehiculosResponse } from './types';

/**
 * Los datos de flota se filtran por empresa: principio de mínimo privilegio del diseño.
 * El operador portuario ve toda la flota; el transportista solo la suya; el conductor,
 * únicamente su propia ficha.
 */
@Injectable()
export class FlotaService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
  ) {}

  async obtenerVehiculos(usuario: UsuarioSesion): Promise<VehiculosResponse> {
    const vehiculos = await this.vehiculoRepository.find({
      where: usuario.rol === 'OPERADOR_PORTUARIO' ? {} : { empresaId: usuario.empresaId ?? '' },
      order: { placa: 'ASC' },
    });

    return construirRespuesta(200, 'Vehículos obtenidos', vehiculos.map(mapearVehiculo));
  }

  async obtenerConductores(usuario: UsuarioSesion): Promise<ConductoresResponse> {
    const conductores = await this.conductorRepository.find({
      where: this.filtroConductores(usuario),
      order: { nombre: 'ASC' },
    });

    return construirRespuesta(200, 'Conductores obtenidos', conductores.map(mapearConductor));
  }

  private filtroConductores(usuario: UsuarioSesion) {
    if (usuario.rol === 'OPERADOR_PORTUARIO') {
      return {};
    }
    if (usuario.rol === 'CONDUCTOR') {
      return { id: usuario.conductorId ?? '' };
    }
    return { empresaId: usuario.empresaId ?? '' };
  }
}
