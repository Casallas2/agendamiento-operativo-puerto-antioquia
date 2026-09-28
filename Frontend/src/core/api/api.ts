import axios from 'axios';
import { useAuthStore } from '@/core/store/authStore';

export const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Cabecera con la que el cliente declara desde qué área hace la petición */
export const CABECERA_AREA = 'X-Area-Sesion';

/**
 * Área de la plataforma a la que pertenece la ventana actual.
 * Reason: la cabina y el portal usan cookies de sesión distintas para poder estar abiertos
 * a la vez en el mismo navegador; el backend necesita saber cuál de las dos leer.
 */
export const obtenerAreaSesion = (): 'CABINA' | 'PORTAL' =>
  typeof window !== 'undefined' && window.location.pathname.startsWith('/conductor')
    ? 'CABINA'
    : 'PORTAL';

/**
 * Instancia Axios hacia el API Gateway (TLS 1.3 + JWT en cookie httpOnly).
 * El token nunca pasa por JavaScript: viaja en la cookie que emite `/auth/mfa/verify`.
 */
export const api = axios.create({
  baseURL: URL_API,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((configuracion) => {
  configuracion.headers.set(CABECERA_AREA, obtenerAreaSesion());
  return configuracion;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const urlSolicitud: string = error.config?.url ?? '';
    // Reason: el flujo de autenticación maneja sus propios 401 (contraseña o código errado);
    // si el interceptor los capturara, un código MFA equivocado cerraría la sesión.
    const esSolicitudDeAutenticacion = urlSolicitud.includes('/auth/');

    if (error.response?.status === 401 && !esSolicitudDeAutenticacion) {
      await axios.post(
        `${URL_API}/auth/logout`,
        {},
        { withCredentials: true, headers: { [CABECERA_AREA]: obtenerAreaSesion() } },
      );
      useAuthStore.getState().logout();
      // Reason: el interceptor vive fuera de React, no hay router disponible (patrón definido en CLAUDE_front)
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/** Traduce un error de Axios al mensaje en español que envía el backend */
export const extraerMensajeApi = (error: unknown, porDefecto: string): string => {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { message?: string } | undefined)?.message;
    if (mensaje) {
      return mensaje;
    }
    if (!error.response) {
      return 'No pudimos contactar al servidor. Revisa tu conexión.';
    }
  }
  return porDefecto;
};
