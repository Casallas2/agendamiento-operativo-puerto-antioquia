import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'transportista@transuraba.co',
    description: 'Correo corporativo registrado del usuario',
  })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @MaxLength(255, { message: 'El correo no puede superar 255 caracteres' })
  correo: string;

  @ApiProperty({
    example: 'Puerto2026!',
    description: 'Contraseña de la cuenta',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MaxLength(128, { message: 'La contraseña no puede superar 128 caracteres' })
  contrasena: string;
}
