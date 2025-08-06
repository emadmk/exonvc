/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8050',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8050/ws',
  },

  // Image optimization
  images: {
    domains: ['localhost', 'invest.exonvc.ir'],
    unoptimized: true
  },

  // Disable telemetry
  telemetry: false,

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Remove deprecated experimental.appDir option
  // experimental: {
  //   appDir: false  // این deprecated شده - حذف می‌کنیم
  // }
}

module.exports = nextConfig