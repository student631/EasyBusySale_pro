import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (stable)
  turbopack: {
    resolveAlias: {
      // Optimize for faster builds
      '@': './src',
    },
  },
  // Reduce concurrent builds to prevent worker overload
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Optimize output
  output: 'standalone',
  // Disable source maps in development to reduce memory usage
  productionBrowserSourceMaps: false,
};

export default nextConfig;
