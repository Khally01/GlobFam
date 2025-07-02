"use client"

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { importApi } from '@/lib/api/import'
import { api } from '@/lib/api'
import type { Asset } from '@/lib/shared-types'

interface SimpleImportModalProps {
  isOpen: boolean
  onClose: () => void
  assets: Asset[]
  onImportComplete: () => void
}

export function SimpleImportModal({ isOpen, onClose, assets, onImportComplete }: SimpleImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0])
        setError(null)
      }
    }
  })

  const handleImport = async () => {
    if (!selectedFile || !selectedAsset) {
      setError('Please select both a file and an asset')
      return
    }

    setImporting(true)
    setError(null)

    try {
      // First, preview the file to get headers
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const preview = await importApi.previewFile(formData)
      
      // Auto-detect common column names
      const columnMapping = {
        date: preview.headers.find(h => 
          h.toLowerCase().includes('date') || 
          h.toLowerCase().includes('time')
        ) || preview.headers[0],
        description: preview.headers.find(h => 
          h.toLowerCase().includes('desc') || 
          h.toLowerCase().includes('merchant') ||
          h.toLowerCase().includes('payee')
        ) || preview.headers[1],
        amount: preview.headers.find(h => 
          h.toLowerCase().includes('amount') || 
          h.toLowerCase().includes('value')
        ) || preview.headers[2],
        type: preview.headers.find(h => 
          h.toLowerCase().includes('type') ||
          h.toLowerCase().includes('debit') ||
          h.toLowerCase().includes('credit')
        ),
        category: preview.headers.find(h => 
          h.toLowerCase().includes('category')
        )
      }

      // Process the import
      const importFormData = new FormData()
      importFormData.append('file', selectedFile)
      importFormData.append('assetId', selectedAsset)
      importFormData.append('columnMapping', JSON.stringify(columnMapping))
      importFormData.append('skipDuplicates', 'true')

      const result = await importApi.processImport(importFormData)

      toast({
        title: 'Import successful!',
        description: `Imported ${result.successfulRows} transactions.`
      })
      
      // Trigger AI categorization after a short delay
      setTimeout(async () => {
        try {
          await api.post('/api/ai/categorize-transactions', { 
            importId: result.importId,
            limit: 100
          })
          
          toast({
            title: 'AI Categorization Complete',
            description: 'Your transactions have been automatically categorized.',
          })
        } catch (error) {
          console.error('AI categorization failed:', error)
        }
      }, 2000)

      onImportComplete()
      handleClose()
    } catch (error: any) {
      console.error('Import error:', error)
      setError(error.message || 'Import failed. Please check your file format and try again.')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setSelectedAsset('')
    setError(null)
    setImporting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Import Transactions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Asset Selection */}
          {assets.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Create an asset first before importing transactions.
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Account</label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose account for transactions" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Upload File</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
                ${assets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={assets.length === 0} />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Drop your CSV/Excel file here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll automatically detect columns
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              After import, transactions will be automatically categorized using AI.
              You can review and adjust categories later.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || !selectedAsset || importing || assets.length === 0}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}