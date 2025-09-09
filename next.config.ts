import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Для локальных изображений
  },
  // Увеличиваем лимит размера тела запроса
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Настройки для API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Увеличиваем лимит до 50MB
    },
  },
};

export default nextConfig;
