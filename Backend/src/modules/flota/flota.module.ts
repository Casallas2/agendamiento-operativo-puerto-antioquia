import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor, Empresa, Vehiculo } from './entities';
import { FlotaController } from './flota.controller';
import { FlotaService } from './flota.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Conductor, Empresa])],
  controllers: [FlotaController],
  providers: [FlotaService],
  exports: [FlotaService, TypeOrmModule],
})
export class FlotaModule {}
