import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosModule } from 'src/modules/eventos/eventos.module';
import { FlotaModule } from 'src/modules/flota/flota.module';
import { Muelle } from 'src/modules/muelles/entities';
import { UsersModule } from 'src/modules/users/users.module';
import { ValidacionModule } from 'src/modules/validacion/validacion.module';
import { EventoTurno, Franja, Turno, ValidacionTurno } from './entities';
import { FranjasController } from './franjas.controller';
import { FranjasService } from './franjas.service';
import { TurnosConsultaService } from './turnos-consulta.service';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turno, Franja, ValidacionTurno, EventoTurno, Muelle]),
    FlotaModule,
    UsersModule,
    EventosModule,
    ValidacionModule,
  ],
  controllers: [TurnosController, FranjasController],
  providers: [TurnosService, TurnosConsultaService, FranjasService],
  exports: [TurnosService, TurnosConsultaService, FranjasService, TypeOrmModule],
})
export class TurnosModule {}
