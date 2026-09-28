import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { construirOpcionesTypeOrm } from './opciones-typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        construirOpcionesTypeOrm(
          (clave: string, porDefecto?: string) => configService.get<string>(clave) ?? porDefecto,
        ),
    }),
  ],
})
export class DatabaseModule {}
