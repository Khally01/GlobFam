"use client"

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { importApi } from '@/lib/api/import'
import type { Asset } from '@/lib/shared-types'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  assets: Asset[]
  onImportComplete: () => void
}

interface FilePreview {
  fileName: string
  fileType: 'csv' | 'excel'
  headers: string[]
  preview: Record<string, any>[]
  sheets?: string[]
  suggestedMapping: Record<string, string>
}

interface ColumnMapping {
  date: string
  description: string
  amount: string
  currency?: string
  category?: string
  type?: string
}

export function ImportModal({ isOpen, onClose, assets, onImportComplete }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    amount: ''
  })
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<any>(null)
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
        await handleFilePreview(acceptedFiles[0])
      }
    }
  })

  const handleFilePreview = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (selectedSheet) {
        formData.append('sheetName', selectedSheet)
      }

      const preview = await importApi.previewFile(formData)
      setFilePreview(preview)
      
      // Set suggested mapping
      if (preview.suggestedMapping) {
        setColumnMapping({
          date: preview.suggestedMapping.date || '',
          description: preview.suggestedMapping.description || '',
          amount: preview.suggestedMapping.amount || '',
          currency: preview.suggestedMapping.currency,
          category: preview.suggestedMapping.category,
          type: preview.suggestedMapping.type
        })
      }

      // Set first sheet if Excel
      if (preview.sheets && preview.sheets.length > 0) {
        setSelectedSheet(preview.sheets[0])
      }

      setStep('mapping')
    } catch (error) {
      setError('Failed to preview file. Please check the file format.')
      console.error('Preview error:', error)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !selectedAsset || !columnMapping.date || !columnMapping.description || !columnMapping.amount) {
      setError('Please complete all required fields')
      return
    }

    setStep('importing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('assetId', selectedAsset)
      formData.append('columnMapping', JSON.stringify(columnMapping))
      if (selectedSheet) {
        formData.append('sheetName', selectedSheet)
      }
      formData.append('skipDuplicates', 'true')

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const result = await importApi.processImport(formData)
      
      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResult(result)
      setStep('complete')

      toast({
        title: 'Import successful',
        description: `Imported ${result.successfulRows} transactions successfully.`
      })

      onImportComplete()
    } catch (error) {
      setError('Import failed. Please check your file and try again.')
      setStep('mapping')
      console.error('Import error:', error)
    }
  }

  const resetModal = () => {
    setStep('upload')
    setSelectedFile(null)
    setSelectedAsset('')
    setFilePreview(null)
    setColumnMapping({ date: '', description: '', amount: '' })
    setSelectedSheet('')
    setImportProgress(0)
    setImportResult(null)
    setError(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload File */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Asset</label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset for these transactions" />
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

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop a CSV or Excel file here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: CSV, XLS, XLSX (max 10MB)
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && filePreview && (
          <div className="space-y-4">
            {filePreview.sheets && (
              <div>
                <label className="text-sm font-medium">Select Sheet</label>
                <Select value={selectedSheet} onValueChange={(value) => {
                  setSelectedSheet(value)
                  handleFilePreview(selectedFile!)
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filePreview.sheets.map(sheet => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date Column *</label>
                <Select value={columnMapping.date} onValueChange={(value) => 
                  setColumnMapping(prev => ({ ...prev, date: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date column" />
                  </SelectTrigger>
                  <SelectContent>
                    {filePreview.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Description Column *</label>
                <Select value={columnMapping.description} onValueChange={(value) => 
                  setColumnMapping(prev => ({ ...prev, description: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select description column" />
                  </SelectTrigger>
                  <SelectContent>
                    {filePreview.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount Column *</label>
                <Select value={columnMapping.amount} onValueChange={(value) => 
                  setColumnMapping(prev => ({ ...prev, amount: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount column" />
                  </SelectTrigger>
                  <SelectContent>
                    {filePreview.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Type Column (Optional)</label>
                <Select value={columnMapping.type || ''} onValueChange={(value) => 
                  setColumnMapping(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {filePreview.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="border rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {filePreview.headers.map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filePreview.preview.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {filePreview.headers.map(header => (
                          <td key={header} className="px-3 py-2">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import Transactions
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Importing transactions...</h3>
              <p className="text-sm text-gray-600 mb-4">Please wait while we process your file</p>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">{importProgress}% complete</p>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && importResult && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
              <div className="space-y-1 text-sm">
                <p>Total rows: {importResult.totalRows}</p>
                <p className="text-green-600">Successful: {importResult.successfulRows}</p>
                {importResult.failedRows > 0 && (
                  <p className="text-red-600">Failed: {importResult.failedRows}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}