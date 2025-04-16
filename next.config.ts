import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow builds to complete despite TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to complete despite ESLint errors
    ignoreDuringBuilds: true,
  },
  // Add any other config options here
};

export default nextConfig;
