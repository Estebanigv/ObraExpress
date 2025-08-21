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
    optimizePackageImports: ['lucide-react', 'framer-motion', '@heroicons/react'],
    // Optimizaciones adicionales
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Compilador SWC optimizado
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración turbopack estable
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
          },
        },
      };
    }
    
    // Optimizaciones para desarrollo
    if (dev) {
      config.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    
    return config;
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
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:; object-src 'none';",
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
