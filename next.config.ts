import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // サーバーコンポーネントからの外部フェッチを許可
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
