import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Required for @react-pdf/renderer
      canvas: { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;
