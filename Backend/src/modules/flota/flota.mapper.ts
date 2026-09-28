import { aIso } from 'src/common/types/respuesta-api.type';
import type { Conductor, Vehiculo } from './entities';
import type { ConductorData, VehiculoData } from './types';

export const mapearVehiculo = (vehiculo: Vehiculo): VehiculoData => ({
  id: vehiculo.id,
  placa: vehiculo.placa,
  tipo: vehiculo.tipo,
  marca: vehiculo.marca,
  empresaId: vehiculo.empresaId,
  estadoRunt: vehiculo.estadoRunt,
  vencimientoSoat: aIso(vehiculo.vencimientoSoat),
  vencimientoTecnomecanica: aIso(vehiculo.vencimientoTecnomecanica),
});

export const mapearConductor = (conductor: Conductor): ConductorData => ({
  id: conductor.id,
  nombre: conductor.nombre,
  cedula: conductor.cedula,
  telefono: conductor.telefono,
  categoriaLicencia: conductor.categoriaLicencia,
  vencimientoLicencia: aIso(conductor.vencimientoLicencia),
  empresaId: conductor.empresaId,
});
