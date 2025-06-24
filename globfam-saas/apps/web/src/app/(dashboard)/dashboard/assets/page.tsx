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
  Trash2
} from 'lucide-react'
import { assetsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { RenameAssetDialog } from '@/components/assets/RenameAssetDialog'
import type { Asset, AssetType } from '@/lib/shared-types'

const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['CASH', 'PROPERTY', 'VEHICLE', 'INVESTMENT', 'CRYPTO', 'SUPERANNUATION', 'SOCIAL_INSURANCE', 'DEBT', 'OTHER']),
  subtype: z.string().optional(),
  country: z.string().length(2, 'Country code must be 2 characters'),
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  amount: z.string().min(1, 'Amount is required'),
})

type AssetForm = z.infer<typeof assetSchema>

const ASSET_TYPES = [
  { value: 'CASH', label: 'Cash/Bank Account', icon: Wallet },
  { value: 'PROPERTY', label: 'Property', icon: Home },
  { value: 'VEHICLE', label: 'Vehicle', icon: Car },
  { value: 'INVESTMENT', label: 'Investment', icon: TrendingUp },
  { value: 'CRYPTO', label: 'Cryptocurrency', icon: Bitcoin },
  { value: 'SUPERANNUATION', label: 'Superannuation', icon: PiggyBank },
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
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">
            Track your assets across multiple countries
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Create Asset Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Asset</CardTitle>
            <CardDescription>Enter details about your asset</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(handleCreateAsset)}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Asset Name</label>
                  <Input
                    placeholder="e.g., ANZ Savings Account"
                    {...form.register('name')}
                    disabled={creating}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Asset Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm font-medium">Country</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    {...form.register('currency')}
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('amount')}
                    disabled={creating}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Subtype (Optional)</label>
                  <Input
                    placeholder="e.g., Savings, Checking"
                    {...form.register('subtype')}
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Asset'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
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
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first asset to track your wealth
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const Icon = getAssetIcon(asset.type as AssetType)
            const amount = parseFloat(asset.amount)
            
            return (
              <Card key={asset.id} className="relative group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">
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
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      {asset.currency} {amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Asset Summary</CardTitle>
            <CardDescription>Your wealth distribution by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                assets.reduce((acc, asset) => {
                  const amount = parseFloat(asset.amount)
                  acc[asset.currency] = (acc[asset.currency] || 0) + amount
                  return acc
                }, {} as Record<string, number>)
              ).map(([currency, total]) => (
                <div key={currency} className="flex justify-between">
                  <span className="font-medium">{currency}</span>
                  <span className="text-lg font-semibold">
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