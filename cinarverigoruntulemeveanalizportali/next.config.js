/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't run ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't run TypeScript type checking during builds for faster builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 