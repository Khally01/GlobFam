'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/shared-ui'
import { 
  Plus, 
  Wallet, 
  Home, 
  Car, 
  TrendingUp, 
  Bitcoin,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Shield
} from 'lucide-react'
import { assetsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { RenameAssetDialog } from '@/components/assets/RenameAssetDialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'
import type { Asset, AssetType } from '@/lib/shared-types'

const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['CASH', 'BANK_ACCOUNT', 'PROPERTY', 'VEHICLE', 'INVESTMENT', 'CRYPTO', 'SUPERANNUATION', 'SOCIAL_INSURANCE', 'DEBT', 'OTHER']),
  subtype: z.string().optional(),
  country: z.string().length(2, 'Country code must be 2 characters'),
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  amount: z.string().min(1, 'Amount is required'),
})

type AssetForm = z.infer<typeof assetSchema>

const ASSET_TYPES = [
  { value: 'CASH', label: 'Cash', icon: Wallet },
  { value: 'BANK_ACCOUNT', label: 'Bank Account', icon: Building2 },
  { value: 'PROPERTY', label: 'Property', icon: Home },
  { value: 'VEHICLE', label: 'Vehicle', icon: Car },
  { value: 'INVESTMENT', label: 'Investment', icon: TrendingUp },
  { value: 'CRYPTO', label: 'Cryptocurrency', icon: Bitcoin },
  { value: 'SUPERANNUATION', label: 'Superannuation', icon: PiggyBank },
  { value: 'SOCIAL_INSURANCE', label: 'Social Insurance', icon: Shield },
  { value: 'DEBT', label: 'Debt/Loan', icon: CreditCard },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal },
] as const

const COUNTRIES = [
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'MN', name: 'Mongolia', currency: 'MNT' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'EU', name: 'European Union', currency: 'EUR' },
]

export default function AssetsPage() {
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [renameAsset, setRenameAsset] = useState<Asset | null>(null)

  const form = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      country: 'AU',
      currency: 'AUD',
      type: 'CASH'
    }
  })

  const selectedCountry = form.watch('country')

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    // Auto-update currency when country changes
    const country = COUNTRIES.find(c => c.code === selectedCountry)
    if (country) {
      form.setValue('currency', country.currency)
    }
  }, [selectedCountry, form])

  const fetchAssets = async () => {
    try {
      const response = await assetsApi.getAll()
      setAssets(response.data.data?.assets || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAsset = async (data: AssetForm) => {
    setCreating(true)
    try {
      await assetsApi.create(data)
      await fetchAssets()
      
      toast({
        title: 'Asset created!',
        description: 'Your asset has been added successfully.',
      })
      
      form.reset()
      setShowForm(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create asset',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetsApi.delete(id)
        await fetchAssets()
        
        toast({
          title: 'Asset deleted',
          description: 'The asset has been removed.',
        })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete asset',
          variant: 'destructive',
        })
      }
    }
  }

  const getAssetIcon = (type: AssetType) => {
    const assetType = ASSET_TYPES.find(t => t.value === type)
    return assetType?.icon || MoreHorizontal
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Asset Cards Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="brand-title text-2xl sm:text-brand-h2">Assets</h1>
          <p className="brand-subtitle text-sm sm:text-brand-body text-globfam-steel">
            Track your assets across multiple countries
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="brand-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Create Asset Form */}
      {showForm && (
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="text-globfam-deep-blue">Add New Asset</CardTitle>
            <CardDescription className="text-globfam-steel">Enter details about your asset</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(handleCreateAsset)}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Asset Name</label>
                  <Input
                    placeholder="e.g., ANZ Savings Account"
                    {...form.register('name')}
                    disabled={creating}
                    className="mt-1 border-globfam-border focus:border-primary focus:ring-primary"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-globfam-alert mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Asset Type</label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-brand-md border border-globfam-border bg-white px-3 py-2 text-sm text-globfam-deep-blue focus:border-primary focus:ring-1 focus:ring-primary"
                    {...form.register('type')}
                    disabled={creating}
                  >
                    {ASSET_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Country</label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-brand-md border border-globfam-border bg-white px-3 py-2 text-sm text-globfam-deep-blue focus:border-primary focus:ring-1 focus:ring-primary"
                    {...form.register('country')}
                    disabled={creating}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Currency</label>
                  <Input
                    {...form.register('currency')}
                    disabled={true}
                    className="mt-1 bg-globfam-cloud border-globfam-border text-globfam-steel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('amount')}
                    disabled={creating}
                    className="mt-1 border-globfam-border focus:border-primary focus:ring-primary"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-globfam-alert mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-globfam-deep-blue">Subtype (Optional)</label>
                  <Input
                    placeholder="e.g., Savings, Checking"
                    {...form.register('subtype')}
                    disabled={creating}
                    className="mt-1 border-globfam-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating} className="brand-button">
                  {creating ? 'Creating...' : 'Create Asset'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={PiggyBank}
              title="Start building your wealth portfolio"
              description="Add your first asset to begin tracking your net worth across different currencies and countries."
              action={{
                label: "Add Your First Asset",
                onClick: () => setShowForm(true)
              }}
              secondaryAction={{
                label: "Learn More",
                onClick: () => window.open('/help/assets', '_blank')
              }}
            >
              <div className="grid grid-cols-3 gap-4 mt-8 mb-4 max-w-xs mx-auto">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Bank Accounts</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Properties</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Investments</p>
                </div>
              </div>
            </EmptyState>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const Icon = getAssetIcon(asset.type as AssetType)
            const amount = parseFloat(asset.amount)
            
            return (
              <Card key={asset.id} className="brand-card relative group">
                <CardContent className="p-brand-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-brand-xs">
                      <div className="rounded-full bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-globfam-deep-blue">{asset.name}</h3>
                        <p className="text-sm text-globfam-steel">
                          {asset.subtype} • {asset.country}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setRenameAsset(asset)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-brand-sm">
                    <p className="text-2xl font-bold text-globfam-deep-blue">
                      {asset.currency} {amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-globfam-steel mt-1">
                      Last updated: {new Date(asset.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {assets.length > 0 && (
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="text-globfam-deep-blue">Asset Summary</CardTitle>
            <CardDescription className="text-globfam-steel">Your wealth distribution by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-brand-xs">
              {Object.entries(
                assets.reduce((acc, asset) => {
                  const amount = parseFloat(asset.amount)
                  acc[asset.currency] = (acc[asset.currency] || 0) + amount
                  return acc
                }, {} as Record<string, number>)
              ).map(([currency, total]) => (
                <div key={currency} className="flex justify-between py-2 border-b border-globfam-border last:border-0">
                  <span className="font-medium text-globfam-slate">{currency}</span>
                  <span className="text-lg font-semibold text-globfam-deep-blue">
                    {total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rename Asset Dialog */}
      <RenameAssetDialog 
        asset={renameAsset}
        open={!!renameAsset}
        onOpenChange={(open) => !open && setRenameAsset(null)}
        onSuccess={() => {
          fetchAssets()
          setRenameAsset(null)
        }}
      />
    </div>
  )
}