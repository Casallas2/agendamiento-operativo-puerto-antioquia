export type RolUsuario = 'CONDUCTOR' | 'TRANSPORTISTA' | 'OPERADOR_PORTUARIO';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  telefono: string;
  empresaId?: string;
  empresaNombre?: string;
  conductorId?: string;
}

export interface CredencialesPayload {
  correo: string;
  contrasena: string;
}

export interface VerificacionMfaPayload {
  desafioId: string;
  codigo: string;
}

export interface DesafioMfa {
  desafioId: string;
  telefonoEnmascarado: string;
  nombreUsuario: string;
}

export interface CuentaDemo {
  rol: RolUsuario;
  etiqueta: string;
  descripcion: string;
  correo: string;
  contrasena: string;
}
