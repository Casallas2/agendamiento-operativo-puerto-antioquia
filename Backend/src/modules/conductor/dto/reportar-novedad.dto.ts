import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReportarNovedadDto {
  @ApiProperty({
    example: 'Traffic jam on the road',
    description: 'Novedad reportada desde la cabina; el conductor elige entre opciones frecuentes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La novedad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Debes indicar qué está pasando' })
  @MaxLength(200, { message: 'La novedad no puede superar 200 caracteres' })
  novedad: string;
}
