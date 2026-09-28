import { ShellDashboard } from '@/components/layout/ShellDashboard';

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return <ShellDashboard>{children}</ShellDashboard>;
}
