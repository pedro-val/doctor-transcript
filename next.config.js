/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removida a configuração experimental.appDir que não é mais necessária
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Força o carregamento das variáveis de ambiente
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Enable standalone output for Docker
  output: 'standalone',
}

module.exports = nextConfig