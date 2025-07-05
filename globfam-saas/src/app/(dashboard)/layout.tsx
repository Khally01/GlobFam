import ModernDashboardLayout from './modern-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ModernDashboardLayout>{children}</ModernDashboardLayout>
}