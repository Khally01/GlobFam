'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import type { Asset } from '@/lib/shared-types'

interface RenameAssetDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RenameAssetDialog({ asset, open, onOpenChange, onSuccess }: RenameAssetDialogProps) {
  const [name, setName] = useState(asset?.name || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Update name when asset changes
  useState(() => {
    if (asset) {
      setName(asset.name)
    }
  }, [asset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!asset || !name.trim()) return

    try {
      setLoading(true)
      
      await api.put(`/assets/${asset.id}`, {
        name: name.trim()
      })

      toast({
        title: 'Success',
        description: 'Asset renamed successfully'
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename asset',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Asset</DialogTitle>
          <DialogDescription>
            Give your asset a custom name for easier identification
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Transactions Account"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Current: {asset?.name}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}