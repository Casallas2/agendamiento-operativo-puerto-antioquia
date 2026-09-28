import { api } from '@/core/api/api';
import type { RespuestaApi, RespuestaApiVacia } from '@/core/api/respuestaApi';
import type { CredencialesPayload, DesafioMfa, Usuario, VerificacionMfaPayload } from '../types/auth.types';

/** POST /api/v1/auth/login → responde con un desafío MFA (RNF-02) */
const iniciarSesion = async (credenciales: CredencialesPayload): Promise<DesafioMfa> => {
  const { data } = await api.post<RespuestaApi<DesafioMfa>>('/auth/login', credenciales);
  return data.data;
};

/** POST /api/v1/auth/mfa/verify → el gateway emite la cookie httpOnly con el JWT */
const verificarCodigoMfa = async (payload: VerificacionMfaPayload): Promise<Usuario> => {
  const { data } = await api.post<RespuestaApi<Usuario>>('/auth/mfa/verify', payload);
  return data.data;
};

/** GET /api/v1/auth/me → el rol se confirma siempre contra el servidor */
const obtenerPerfil = async (): Promise<Usuario> => {
  const { data } = await api.get<RespuestaApi<Usuario>>('/auth/me');
  return data.data;
};

/** POST /api/v1/auth/logout → limpia la cookie del área desde la que se pide */
const cerrarSesion = async (): Promise<void> => {
  await api.post<RespuestaApiVacia>('/auth/logout');
};

export const authService = {
  iniciarSesion,
  verificarCodigoMfa,
  obtenerPerfil,
  cerrarSesion,
};
