import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Fotos del catálogo que la vista previa con IA envía a Gemini como referencia de estilo
  outputFileTracingIncludes: {
    "/api/preview-bouquet": ["./public/products/*.jpg"],
  },
  partialPrefetching: true,
  images: {
    qualities: [75, 80, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — imágenes de productos, comprobantes y referencias
        protocol: "https",
        hostname: "ottydrzekgntvbtanznj.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
