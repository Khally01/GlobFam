const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token')
  
  const defaultHeaders: HeadersInit = {
    ...options.headers,
  }
  
  // Only set Content-Type if not already set (for FormData)
  if (!options.body || !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  })
  
  // Handle authentication errors
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  
  return response
}