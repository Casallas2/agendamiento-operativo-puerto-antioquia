import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosModule } from 'src/modules/eventos/eventos.module';
import { Conductor, Vehiculo } from 'src/modules/flota/entities';
import { Muelle } from 'src/modules/muelles/entities';
import { EventoTurno, Turno } from 'src/modules/turnos/entities';
import { UsersModule } from 'src/modules/users/users.module';
import { ConductorController } from './conductor.controller';
import { ConductorService } from './conductor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turno, EventoTurno, Conductor, Vehiculo, Muelle]),
    EventosModule,
    UsersModule,
  ],
  controllers: [ConductorController],
  providers: [ConductorService],
  exports: [ConductorService],
})
export class ConductorModule {}
