import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class DeclararRetrasoDto {
  @ApiProperty({
    example: 45,
    description: 'Minutos de desplazamiento de la ventana de atención',
    minimum: 5,
    maximum: 480,
  })
  @Type(() => Number)
  @IsInt({ message: 'Los minutos deben ser un número entero' })
  @Min(5, { message: 'El retraso mínimo declarable es de 5 minutos' })
  @Max(480, { message: 'El retraso no puede superar 8 horas' })
  minutos: number;

  @ApiProperty({
    example: 'Crane maintenance',
    description: 'Motivo del retraso que se comunica a conductores y transportistas',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo del retraso es requerido' })
  @MaxLength(255, { message: 'El motivo no puede superar 255 caracteres' })
  motivo: string;
}
