import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ Warning: This allows builds to complete despite TypeScript errors
    ignoreBuildErrors: true,
  },
  // Add any other config options here
};

export default nextConfig;
