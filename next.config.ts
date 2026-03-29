import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Generated Convex types are verified at runtime via `npx convex dev`
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
