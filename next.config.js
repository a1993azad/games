/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
    trailingSlash: false,
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    esmExternals: false
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias
    }
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    })
    return config
  }
}

module.exports = nextConfig
