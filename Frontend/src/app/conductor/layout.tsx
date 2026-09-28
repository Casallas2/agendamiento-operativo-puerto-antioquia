import { ShellConductor } from '@/components/layout/ShellConductor';

export default function ConductorLayout({ children }: LayoutProps<'/conductor'>) {
  return <ShellConductor>{children}</ShellConductor>;
}
