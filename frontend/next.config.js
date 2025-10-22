/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'export' for Cloudflare Workers, 'standalone' for traditional deployments
  output: process.env.CF_PAGES ? "export" : "standalone",
  images: {
    unoptimized: true,
  },
  // Avoid any remote font optimization/fetching
  optimizeFonts: false,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
  },
  // Disable trailing slashes for better Cloudflare compatibility
  trailingSlash: false,
  // Experimental features for edge compatibility
  experimental: {
    // Enable if using App Router with Cloudflare
    // serverActions: false,
  },
};

module.exports = nextConfig;
