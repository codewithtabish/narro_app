
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components for the "use cache" directive.
  cacheComponents: true,

  // Enable Partial Prefetching alongside Cache Components.
  partialPrefetching: true,

  experimental: {
    // Allow uploads up to 10 MB through Server Actions.
    serverActions: {
      bodySizeLimit: "10mb",
    },

    // Optimize imports from these packages.
    optimizePackageImports: [
      "lucide-react",
      "@clerk/nextjs",
      "radix-ui",
      "react-hook-form",
      "zod",
      "sonner",
      "@editorjs/editorjs",
    ],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
