import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Muelle } from 'src/modules/muelles/entities';
import { Franja, Turno } from 'src/modules/turnos/entities';
import { PuntoEspera } from './entities';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Franja, Muelle, PuntoEspera])],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
