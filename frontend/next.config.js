/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use default server output to support dynamic routes (e.g., NextAuth)
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
}

module.exports = nextConfig
