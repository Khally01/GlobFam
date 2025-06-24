/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to prevent double renders
  images: {
    domains: ['ui-avatars.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  // Suppress the quick-fetch warning
  experimental: {
    instrumentationHook: false,
  },
  // Increase timeout for API calls
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;