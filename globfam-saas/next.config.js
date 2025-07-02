/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ui-avatars.com'],
  },
  experimental: {
    instrumentationHook: false,
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for autoprefixer and other modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  transpilePackages: ['lucide-react'],
};

module.exports = nextConfig;