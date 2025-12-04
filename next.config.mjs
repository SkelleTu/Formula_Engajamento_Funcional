/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Vercel Serverless
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },

  // Configuração de imagens
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
