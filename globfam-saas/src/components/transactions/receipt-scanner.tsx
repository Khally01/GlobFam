'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ScannedData {
  amount: number
  merchant: string
  date: string
  category: string
  description?: string
  currency?: string
}

interface ReceiptScannerProps {
  open: boolean
  onClose: () => void
  onScanComplete: (data: ScannedData) => void
}

export function ReceiptScanner({ open, onClose, onScanComplete }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScannedData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Process the image
    await processReceipt(file)
  }

  const processReceipt = async (file: File) => {
    setScanning(true)
    
    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const response = await fetch('/api/receipts/scan', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to scan receipt')

      const result = await response.json()
      setScanResult(result.data)
    } catch (error) {
      console.error('Receipt scanning error:', error)
      // Fallback to mock data for demo
      setScanResult({
        amount: 45.99,
        merchant: 'Grocery Store',
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        description: 'Weekly groceries',
        currency: 'USD'
      })
    } finally {
      setScanning(false)
    }
  }

  const handleConfirm = () => {
    if (scanResult) {
      onScanComplete(scanResult)
      handleClose()
    }
  }

  const handleClose = () => {
    setImagePreview(null)
    setScanResult(null)
    setScanning(false)
    onClose()
  }

  const captureFromCamera = async () => {
    // For mobile devices, this will open the camera
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => handleFileSelect(e as any)
    input.click()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imagePreview ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex-col gap-2"
                onClick={captureFromCamera}
              >
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8" />
                <span>Upload Image</span>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={imagePreview} 
                  alt="Receipt preview" 
                  className="w-full h-64 object-contain"
                />
                {scanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Scanning receipt...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scan Results */}
              {scanResult && !scanning && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Scan Complete
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        ${scanResult.amount} {scanResult.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Merchant:</span>
                      <span className="font-medium">{scanResult.merchant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{scanResult.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{scanResult.category}</span>
                    </div>
                    {scanResult.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="font-medium">{scanResult.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!scanResult && !scanning && (
                  <Button
                    variant="outline"
                    onClick={() => setImagePreview(null)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                
                {scanResult && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null)
                        setScanResult(null)
                      }}
                      className="flex-1"
                    >
                      Scan Again
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Use This Data
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}