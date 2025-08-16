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
};

export default nextConfig;
