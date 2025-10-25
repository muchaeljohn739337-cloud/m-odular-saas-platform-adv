/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'standalone' for traditional Node.js deployments (Render, Heroku, etc)
  output: 'standalone',
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
  // Disable trailing slashes
  trailingSlash: false,
};

module.exports = nextConfig;
