const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:4000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/socket.io/:path*`
          : 'http://localhost:4000/socket.io/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
