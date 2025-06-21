import { apiClient } from './client'

export interface ImportPreview {
  fileName: string
  fileType: 'csv' | 'excel'
  headers: string[]
  preview: Record<string, any>[]
  sheets?: string[]
  suggestedMapping?: Record<string, string>
}

export interface ImportResult {
  success: boolean
  importId: string
  totalRows: number
  successfulRows: number
  failedRows: number
  errors?: Array<{ row: number; error: string }>
}

export interface ImportHistory {
  id: string
  type: string
  fileName?: string
  status: string
  totalRows: number
  successfulRows: number
  failedRows: number
  asset?: {
    id: string
    name: string
    currency: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  completedAt?: string
}

export const importApi = {
  async previewFile(formData: FormData): Promise<ImportPreview> {
    const response = await apiClient('/import/preview', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to preview file')
    }
    
    return response.json()
  },

  async processImport(formData: FormData): Promise<ImportResult> {
    const response = await apiClient('/import/process', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to import file')
    }
    
    return response.json()
  },

  async getImportHistory(limit: number = 10): Promise<ImportHistory[]> {
    const response = await apiClient(`/import/history?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch import history')
    }
    
    return response.json()
  },

  async getImportDetails(importId: string): Promise<ImportHistory & { transactions: any[] }> {
    const response = await apiClient(`/import/${importId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch import details')
    }
    
    return response.json()
  }
}