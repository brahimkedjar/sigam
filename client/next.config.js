/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.css': ['css'], // new format for handling CSS
    },
  },
};

module.exports = nextConfig;
