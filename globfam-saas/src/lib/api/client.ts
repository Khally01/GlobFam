const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Supabase handles auth via cookies, no need for manual token management
  
  const defaultHeaders: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Only set Content-Type if not already set (for FormData)
  if (!options.body || !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  })
  
  // Handle authentication errors
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      // Only redirect if we're not already on the login page
      const currentPath = window.location.pathname
      if (!currentPath.includes('/login')) {
        // Supabase will handle clearing auth cookies
        window.location.href = '/login'
      }
    }
  }
  
  return response
}