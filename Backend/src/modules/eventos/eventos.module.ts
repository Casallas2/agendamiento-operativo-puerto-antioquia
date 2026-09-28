import { Module } from '@nestjs/common';
import { NotificacionesModule } from 'src/modules/notificaciones/notificaciones.module';
import { BusEventosService } from './bus-eventos.service';
import { EventosController } from './eventos.controller';
import { DespachadorNotificaciones } from './observadores/despachador-notificaciones.observer';

@Module({
  imports: [NotificacionesModule],
  controllers: [EventosController],
  providers: [BusEventosService, DespachadorNotificaciones],
  exports: [BusEventosService],
})
export class EventosModule {}
