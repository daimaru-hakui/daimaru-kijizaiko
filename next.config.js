/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Chakra UI v2 が moduleResolution:bundler と型非互換 — Phase 4 (shadcn/ui 移行) で解消予定
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
