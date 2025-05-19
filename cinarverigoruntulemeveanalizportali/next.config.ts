import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  env: {
    DATABASE_URL: "postgresql://postgres:123@localhost:5432/cinar_portal",
    JWT_SECRET: "cinar-secret-key-123456789",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
};

export default nextConfig;
