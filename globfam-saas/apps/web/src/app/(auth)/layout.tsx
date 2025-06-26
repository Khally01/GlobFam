export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-globfam-cloud">
      <div className="w-full max-w-md p-brand-sm">
        <div className="mb-brand-lg text-center">
          <h1 className="brand-logo text-4xl">GlobFam</h1>
          <p className="text-globfam-steel mt-2">Global Family Finance Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}