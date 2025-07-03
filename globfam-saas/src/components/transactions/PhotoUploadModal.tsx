'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  assetId: string
  onSuccess: (transactionData: any) => void
}

export function PhotoUploadModal({ isOpen, onClose, assetId, onSuccess }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic']
    },
    maxFiles: 1,
    onDrop,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      setExtracting(true)
      
      // TODO: In a real implementation, you would:
      // 1. Send the image to an OCR service (like Google Vision, AWS Textract)
      // 2. Extract transaction details (amount, date, merchant)
      // 3. Use AI to categorize the transaction
      
      // For now, we'll create a basic transaction with manual entry
      const extractedData = {
        amount: 0,
        description: 'Receipt upload - Please update details',
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        receipt_url: publicUrl,
        notes: `Receipt uploaded: ${selectedFile.name}`
      }

      toast({
        title: 'Receipt uploaded!',
        description: 'Please review and update the transaction details.',
      })

      onSuccess(extractedData)
      handleClose()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload receipt',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setExtracting(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Receipt Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input {...getInputProps()} />
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragActive
                  ? 'Drop the receipt here...'
                  : 'Drag & drop a receipt photo, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                Supports PNG, JPG, JPEG, WEBP (max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={preview}
                  alt="Receipt preview"
                  width={400}
                  height={300}
                  className="w-full rounded-lg object-contain max-h-[300px]"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Alert>
                <AlertDescription>
                  After upload, you'll need to manually enter the transaction details. 
                  Automatic receipt scanning is coming soon!
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || extracting}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : extracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Receipt
                    </>
                  )}
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}