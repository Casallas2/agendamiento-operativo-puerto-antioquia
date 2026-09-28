import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Deben coincidir con CLAVE_COOKIE_CABINA y CLAVE_COOKIE_PORTAL de core/config/catalogos
const COOKIE_CABINA = 'puerto-sesion-cabina';
const COOKIE_PORTAL = 'puerto-sesion-portal';

/**
 * Verificación optimista en el servidor: cada área exige su propia sesión antes de renderizar.
 * Reason: /login no redirige aunque exista sesión, porque otra ventana puede estar entrando con otro rol;
 * la vista de login redirige en el cliente si esa ventana ya tiene sesión.
 */
export function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  const cookieArea = ruta.startsWith('/conductor') ? COOKIE_CABINA : COOKIE_PORTAL;

  if (!request.cookies.get(cookieArea)?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/conductor/:path*'],
};
