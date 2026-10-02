import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateIf,
} from 'class-validator';
import { TIPOS_OPERACION, type TipoOperacion } from 'src/common/types/dominio.type';

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const recortarEnMayusculas = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CrearTurnoDto {
  @ApiProperty({ example: 'uuid-here', description: 'Vehículo con el que se hará la operación' })
  @IsUUID('4', { message: 'El vehículo seleccionado no es válido' })
  vehiculoId: string;

  @ApiProperty({ example: 'uuid-here', description: 'Conductor asignado al turno' })
  @IsUUID('4', { message: 'El conductor seleccionado no es válido' })
  conductorId: string;

  @ApiProperty({ example: 'EXPORTACION', enum: TIPOS_OPERACION })
  @IsIn(TIPOS_OPERACION, { message: 'El tipo de operación debe ser EXPORTACION o IMPORTACION' })
  tipoOperacion: TipoOperacion;

  @ApiProperty({ example: 'Refrigerated banana', description: 'Tipo de carga transportada' })
  @Transform(recortar)
  @IsString({ message: 'El tipo de carga debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de carga es requerido' })
  @MaxLength(80, { message: 'El tipo de carga no puede superar 80 caracteres' })
  tipoCarga: string;

  @ApiProperty({ example: 'MAN-2026-004512', description: 'Número del manifiesto de carga de la DIAN' })
  @Transform(recortarEnMayusculas)
  @Matches(/^MAN-\d{4}-\d{6}$/, {
    message: 'El manifiesto debe tener el formato MAN-AAAA-NNNNNN',
  })
  numeroManifiesto: string;

  @ApiProperty({ example: 'BL-PA-88213', description: 'Número del conocimiento de embarque' })
  @Transform(recortarEnMayusculas)
  @Matches(/^BL-[A-Z]{2}-\d{5}$/, { message: 'El BL debe tener el formato BL-XX-NNNNN' })
  numeroBl: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Contenedor refrigerado (banano): usa la cuota prioritaria de la franja (OCI-001)',
  })
  @IsOptional()
  @IsBoolean({ message: 'La carga refrigerada debe indicarse como verdadero o falso' })
  cargaRefrigerada?: boolean;

  @ApiPropertyOptional({
    example: 'CFE-2026-001204',
    description: 'Certificado fitosanitario de exportación del ICA. Obligatorio si la carga es refrigerada',
  })
  @ValidateIf((turno: CrearTurnoDto) => turno.cargaRefrigerada === true)
  @Transform(recortarEnMayusculas)
  @Matches(/^CFE-\d{4}-\d{6}$/, {
    message: 'El certificado fitosanitario debe tener el formato CFE-AAAA-NNNNNN',
  })
  numeroCertificadoIca?: string;

  @ApiProperty({ example: 'uuid-here', description: 'Franja horaria que se quiere reservar' })
  @IsUUID('4', { message: 'La franja seleccionada no es válida' })
  franjaId: string;

  @ApiPropertyOptional({ example: 'Oversized cargo', description: 'Observaciones para el operador' })
  @IsOptional()
  @Transform(recortar)
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las observaciones no pueden superar 500 caracteres' })
  observaciones?: string;
}
