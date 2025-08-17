import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Headers de seguridad
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
};

export default nextConfig;
