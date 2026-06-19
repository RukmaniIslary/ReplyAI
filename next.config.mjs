/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Suppress the known @supabase/ssr Edge Runtime process.version warning
    // This is a false positive — the code path is never hit in Edge
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { isServer }) => {
    // Suppress the process.version warning from @supabase internals
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js/ },
      { module: /node_modules\/@supabase\/ssr/ },
    ]
    return config
  },
}

export default nextConfig
