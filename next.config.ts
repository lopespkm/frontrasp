import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ultrapanel.shop',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ultrapanel.shop',
        pathname: '/**', // permite qualquer imagem do domínio
      },
      {
        protocol: 'https',
        hostname: 'sucessogrupo.shop',
        pathname: '/imagemsras/**', // ajuste conforme necessário
      },
    ],
  },
};

export default nextConfig;
