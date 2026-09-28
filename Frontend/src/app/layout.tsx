import type { Metadata, Viewport } from 'next';
import { Lexend, Source_Sans_3, Geist_Mono } from 'next/font/google';
import { AppProviders } from '@/core/providers/AppProviders';
import './globals.css';

/**
 * Lexend para títulos y cifras: fue diseñada para mejorar la velocidad de lectura, lo que
 * importa cuando el conductor mira la pantalla de reojo en cabina (R-01).
 */
const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  display: 'swap',
});

/** Source Sans 3 para el cuerpo: humanista, muy legible en tablas densas del portal */
const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Agendamiento Operativo | Puerto Antioquia',
    template: '%s | Puerto Antioquia',
  },
  description:
    'Prototipo de la plataforma de agendamiento de turnos para tractocamiones de Puerto Antioquia: reservas, validación documental y avisos en tiempo real.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Reason: no se fija maximumScale para no bloquear el zoom (accesibilidad)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1d4f91' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${lexend.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
