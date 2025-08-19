import type { NextConfig } from "next";

// Configuración condicional basada en el entorno
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Export estático para Hostinger
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  
  // Configuración de imágenes para modo desarrollo/producción
  ...(!isStaticExport && {
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 31536000, // 1 año
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
  }),
  
  eslint: {
    // No bloquear el build por reglas ESLint en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // No bloquear por type errors en el build
    ignoreBuildErrors: true,
  },
  // Optimizaciones para deployment
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuración experimental para mejor compatibilidad
  experimental: {
    // Asegurar compatibilidad con Vercel
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Headers de seguridad (solo para Vercel, no para static export)
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
