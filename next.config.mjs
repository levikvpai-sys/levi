

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["openai", "@anthropic-ai/sdk"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "*.openai.com" },
    ],
  },
};

export default nextConfig;
