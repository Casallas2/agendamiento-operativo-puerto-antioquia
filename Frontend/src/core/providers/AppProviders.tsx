'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Reason: los observadores de dominio y la reanudación de validaciones viven ahora en el
 * backend NestJS (bus de eventos y `ValidacionDocumentalService`), por lo que el cliente
 * solo necesita el proveedor de consultas y el de tema.
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
