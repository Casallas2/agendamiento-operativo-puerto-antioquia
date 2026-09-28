import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ConsultarFranjasDto {
  @ApiProperty({ example: '2026-09-19', description: 'Día de la agenda en formato AAAA-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  fecha: string;
}
