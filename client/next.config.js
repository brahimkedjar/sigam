// next.config.js
const nextConfig = {
  
  // Remove the turbopack section
  webpack: (config, { isServer }) => {
    
    return config;
  },
};

module.exports = nextConfig;
