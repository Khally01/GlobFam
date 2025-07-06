// import ModernDashboardLayout from './modern-layout'
import DebugDashboardLayout from './debug-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily using debug layout to diagnose issues
  return <DebugDashboardLayout>{children}</DebugDashboardLayout>
  // return <ModernDashboardLayout>{children}</ModernDashboardLayout>
}