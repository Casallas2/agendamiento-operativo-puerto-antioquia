import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Between, Repository } from 'typeorm';
import { construirRespuesta } from 'src/common/types/respuesta-api.type';
import { Franja } from './entities';
import { mapearFranja } from './turnos.mapper';
import type { FranjasResponse } from './types';

@Injectable()
export class FranjasService {
  constructor(
    @InjectRepository(Franja)
    private readonly franjaRepository: Repository<Franja>,
  ) {}

  /** Agenda de un día concreto, con la ocupación al momento de la consulta */
  async obtenerPorFecha(fecha: string): Promise<FranjasResponse> {
    const dia = parseISO(fecha);

    const franjas = await this.franjaRepository.find({
      where: { inicio: Between(startOfDay(dia), endOfDay(dia)) },
      order: { inicio: 'ASC' },
    });

    return construirRespuesta(200, 'Franjas obtenidas', franjas.map(mapearFranja));
  }
}
