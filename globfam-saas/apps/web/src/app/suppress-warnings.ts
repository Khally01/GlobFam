// Suppress third-party warnings in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args) => {
    const message = args[0]?.toString() || ''
    
    // Suppress known third-party warnings
    if (
      message.includes('quickFetchScript') ||
      message.includes('hubspot.define') ||
      message.includes('HubSpot') ||
      message.includes('quick-fetch')
    ) {
      return
    }
    
    originalWarn.apply(console, args)
  }

  console.error = (...args) => {
    const message = args[0]?.toString() || ''
    
    // Suppress non-critical errors
    if (
      message.includes('quickFetchScript') ||
      message.includes('hubspot')
    ) {
      return
    }
    
    originalError.apply(console, args)
  }
}