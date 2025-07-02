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
};

module.exports = nextConfig;