import ModernDashboardLayout from './modern-layout'
// import DebugDashboardLayout from './debug-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ModernDashboardLayout>{children}</ModernDashboardLayout>
}