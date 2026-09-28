import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class VerificarMfaDto {
  @ApiProperty({
    example: '3f1b8e2a-5c7d-4a91-b0e6-2d4c8f1a9b33',
    description: 'Identificador del desafío emitido en el inicio de sesión',
  })
  @IsUUID('4', { message: 'El identificador del desafío no es válido' })
  @IsNotEmpty({ message: 'El identificador del desafío es requerido' })
  desafioId: string;

  @ApiProperty({
    example: '246810',
    description: 'Código de verificación de 6 dígitos enviado al teléfono del usuario',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  codigo: string;
}
