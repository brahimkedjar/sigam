// next.config.js
const fs = require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    disableFontOptimization: true,
  },
  webpack: (config, { isServer }) => {
    return config;
  },
};

module.exports = nextConfig;
