/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removida a configuração experimental.appDir que não é mais necessária
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig