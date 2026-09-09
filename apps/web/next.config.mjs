/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rideflow/shared'],
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiTarget}/api/v1/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiTarget}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
