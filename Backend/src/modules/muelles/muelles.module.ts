import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosModule } from 'src/modules/eventos/eventos.module';
import { EventoTurno, Turno } from 'src/modules/turnos/entities';
import { UsersModule } from 'src/modules/users/users.module';
import { Muelle } from './entities';
import { MuellesController } from './muelles.controller';
import { MuellesService } from './muelles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Muelle, Turno, EventoTurno]), EventosModule, UsersModule],
  controllers: [MuellesController],
  providers: [MuellesService],
  exports: [MuellesService, TypeOrmModule],
})
export class MuellesModule {}
