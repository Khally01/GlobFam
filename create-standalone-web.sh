#!/bin/bash

echo "🌐 Creating standalone web app for easy deployment..."

# Create directory
mkdir -p ~/globfam-web-standalone
cd ~/globfam-web-standalone

# Create a simple Next.js app that connects to your API
cat > package.json << 'EOF'
{
  "name": "globfam-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  }
}
EOF

# Create pages directory
mkdir -p pages

# Create a simple home page
cat > pages/index.js << 'EOF'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking...')
  
  useEffect(() => {
    axios.get(process.env.NEXT_PUBLIC_API_URL + '/health')
      .then(res => setApiStatus('API Connected ✅'))
      .catch(() => setApiStatus('API Connection Failed ❌'))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>GlobFam - Multi-Currency Family Finance</h1>
      <p>API Status: {apiStatus}</p>
      <p>Full UI coming soon! For now, use the API directly.</p>
      
      <h2>Quick Links:</h2>
      <ul>
        <li><a href="/api/health">Health Check</a></li>
        <li><a href="/login">Login (coming soon)</a></li>
        <li><a href="/register">Register (coming soon)</a></li>
      </ul>
    </div>
  )
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://globfam-v1.up.railway.app'
  }
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.next/
.env.local
EOF

# Initialize git
git init
git add .
git commit -m "Simple GlobFam web interface"

echo "✅ Standalone web app created!"
echo ""
echo "To deploy:"
echo "1. Create new GitHub repo: 'globfam-web'"
echo "2. Push this code"
echo "3. Deploy to Railway with no special configuration!"