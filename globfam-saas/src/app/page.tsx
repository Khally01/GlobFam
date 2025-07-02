import Link from 'next/link'
import { Button } from '@/components/shared-ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold">
            GlobFam
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Multi-currency Family Finance
            <br />
            <span className="text-primary">for Global Families</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Track your family&apos;s finances across borders. Perfect for international
            students, expats, and global families managing assets in multiple countries.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Key Features</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Multi-Currency Support"
                description="Track assets in USD, AUD, MNT, and more with real-time conversion"
                icon="💱"
              />
              <FeatureCard
                title="Family Sharing"
                description="Share financial data securely with family members across the globe"
                icon="👨‍👩‍👧‍👦"
              />
              <FeatureCard
                title="Visa Compliance"
                description="Track work hours and financial requirements for student visas"
                icon="📋"
              />
              <FeatureCard
                title="Asset Tracking"
                description="Monitor properties, investments, and accounts in multiple countries"
                icon="🏠"
              />
              <FeatureCard
                title="Bank Integration"
                description="Connect to banks via Plaid and Basiq for automatic updates"
                icon="🏦"
              />
              <FeatureCard
                title="Multi-Language"
                description="Available in English and Mongolian with more languages coming"
                icon="🌐"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard
                name="Starter"
                price="$9.99"
                features={[
                  'Track assets across 2 countries',
                  'Basic budgeting tools',
                  'Email support',
                  'Mobile app access',
                ]}
              />
              <PricingCard
                name="Family"
                price="$19.99"
                features={[
                  'Everything in Starter',
                  'Unlimited countries',
                  'Family sharing (up to 5)',
                  'Advanced analytics',
                  'Priority support',
                ]}
                popular
              />
              <PricingCard
                name="Premium"
                price="$39.99"
                features={[
                  'Everything in Family',
                  'Unlimited family members',
                  'Bank connections',
                  'Tax optimization tools',
                  'Dedicated support',
                ]}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 GlobFam. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  features,
  popular = false,
}: {
  name: string
  price: string
  features: string[]
  popular?: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-6 text-card-foreground ${
        popular ? 'ring-2 ring-primary' : ''
      }`}
    >
      {popular && (
        <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold">{name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/register" className="mt-8 block">
        <Button className="w-full" variant={popular ? 'default' : 'outline'}>
          Get Started
        </Button>
      </Link>
    </div>
  )
}