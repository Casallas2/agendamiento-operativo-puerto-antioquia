import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ESTADOS_TURNO, type EstadoTurno } from 'src/common/types/dominio.type';

const ESTADOS_FILTRABLES = [...ESTADOS_TURNO, 'TODOS'] as const;

export class FiltroTurnosDto {
  @ApiPropertyOptional({ enum: ESTADOS_FILTRABLES, description: 'Estado por el que filtrar' })
  @IsOptional()
  @IsIn(ESTADOS_FILTRABLES, { message: 'El estado del filtro no es válido' })
  estado?: EstadoTurno | 'TODOS';

  @ApiPropertyOptional({
    example: 'TRN-1001',
    description: 'Busca por código, placa, conductor, muelle o empresa',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  @MaxLength(80, { message: 'La búsqueda no puede superar 80 caracteres' })
  busqueda?: string;
}
