#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Checks if all required environment variables are set
 */

const requiredEnvVars = {
  // Supabase (Critical for auth)
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co',
    critical: true
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (for server-side operations)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true
  },
  
  // Optional but recommended
  NEXT_PUBLIC_APP_URL: {
    description: 'Application URL',
    example: 'https://www.globfam.com.au',
    critical: false
  },
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:password@localhost:5432/globfam',
    critical: false
  }
}

console.log('🔍 Validating environment variables...\n')

let hasErrors = false
let hasCriticalErrors = false
const missingVars = []
const setVars = []

// Check each required variable
Object.entries(requiredEnvVars).forEach(([varName, config]) => {
  const value = process.env[varName]
  
  if (!value) {
    missingVars.push({ name: varName, ...config })
    hasErrors = true
    if (config.critical) {
      hasCriticalErrors = true
    }
  } else {
    setVars.push(varName)
  }
})

// Display results
if (setVars.length > 0) {
  console.log('✅ Set environment variables:')
  setVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  console.log('')
}

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:')
  missingVars.forEach(({ name, description, example, critical }) => {
    const criticalTag = critical ? ' [CRITICAL]' : ''
    console.log(`   - ${name}${criticalTag}`)
    console.log(`     Description: ${description}`)
    console.log(`     Example: ${example}`)
    console.log('')
  })
}

// Check if we're in production
if (process.env.NODE_ENV === 'production' && hasCriticalErrors) {
  console.error('🚨 CRITICAL: Missing required environment variables for production!')
  process.exit(1)
}

// Summary
console.log('📊 Summary:')
console.log(`   Total variables checked: ${Object.keys(requiredEnvVars).length}`)
console.log(`   Variables set: ${setVars.length}`)
console.log(`   Variables missing: ${missingVars.length}`)

if (hasCriticalErrors) {
  console.log('\n⚠️  Warning: Critical environment variables are missing.')
  console.log('The application may not function properly without these.\n')
  
  // In development, show how to set them
  if (process.env.NODE_ENV !== 'production') {
    console.log('💡 To set these variables locally:')
    console.log('   1. Copy .env.example to .env.local')
    console.log('   2. Fill in the missing values')
    console.log('   3. Restart your development server\n')
  }
} else if (hasErrors) {
  console.log('\n⚠️  Some optional environment variables are missing.')
  console.log('The application will work but some features may be limited.\n')
} else {
  console.log('\n✅ All environment variables are properly configured!\n')
}

// Exit with error code if critical vars are missing
if (hasCriticalErrors && process.env.NODE_ENV === 'production') {
  process.exit(1)
}