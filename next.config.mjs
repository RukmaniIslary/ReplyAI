/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js/ },
      { module: /node_modules\/@supabase\/ssr/ },
    ]
    return config
  },
}

export default nextConfig
