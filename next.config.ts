import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment (supports API routes)
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
