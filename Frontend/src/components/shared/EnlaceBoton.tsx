import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EnlaceBotonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/** Enlace con apariencia de botón: conserva la semántica de navegación (<a>) para accesibilidad */
export const EnlaceBoton = ({ className, variant, size, ...props }: EnlaceBotonProps) => (
  <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
