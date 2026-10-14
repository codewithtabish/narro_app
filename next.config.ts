// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Cache Components (required for the "use cache" directive)
  cacheComponents: true,

  experimental: {
    // Allow uploads up to 10 MB through Server Actions (default is 1 MB)
    serverActions: {
      bodySizeLimit: "10mb",
    },

    // Only bundle the parts of these packages you actually import
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