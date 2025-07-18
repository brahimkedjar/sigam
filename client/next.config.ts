// next.config.js
const withTM = require('next-transpile-modules')([
  '@ant-design/icons-svg' // Fix for Docker SSR build error
]);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // 👈 Your backend
      },
    ];
  },
});

module.exports = nextConfig;
