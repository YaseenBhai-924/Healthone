import type { NextConfig } from 'next'

/**
 * Locally, the browser talks to Next on :3000. Front Door will route
 * `/api/public/*` to the API in Azure; here we rewrite so patient pages
 * can call relative `/api/public/...` without CORS.
 */
const apiBase = process.env.API_BASE_URL ?? 'http://localhost:5101'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/public/:path*',
        destination: `${apiBase}/api/public/:path*`,
      },
    ]
  },
}

export default nextConfig
