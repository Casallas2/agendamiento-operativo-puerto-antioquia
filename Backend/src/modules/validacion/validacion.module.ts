import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosModule } from 'src/modules/eventos/eventos.module';
import { Conductor, Vehiculo } from 'src/modules/flota/entities';
import { EventoTurno, Franja, Turno, ValidacionTurno } from 'src/modules/turnos/entities';
import { UsersModule } from 'src/modules/users/users.module';
import { AdaptadorDian } from './adaptadores/dian.adapter';
import { AdaptadorOperadorPortuario } from './adaptadores/operador-portuario.adapter';
import { RegistroExterno } from './entities';
import { ValidacionDocumentalService } from './validacion-documental.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistroExterno, Turno, ValidacionTurno, EventoTurno, Franja, Conductor, Vehiculo,
    ]),
    EventosModule,
    UsersModule,
  ],
  providers: [AdaptadorDian, AdaptadorOperadorPortuario, ValidacionDocumentalService],
  exports: [ValidacionDocumentalService],
})
export class ValidacionModule {}
