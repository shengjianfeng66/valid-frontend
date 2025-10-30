import bundleAnalyzer from "@next/bundle-analyzer"
import { codeInspectorPlugin } from "code-inspector-plugin"
import { createMDX } from "fumadocs-mdx/next"
import createNextIntlPlugin from "next-intl/plugin"

const withMDX = createMDX()

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const withNextIntl = createNextIntlPlugin()

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return []
    } else if (process.env.NODE_ENV === "test") {
      return [
        {
          source: "/api/v1/:path*",
          destination: "http://127.0.0.1:8000/api/v1/:path*",
        },
      ]
    }
  },

  async redirects() {
    return []
  },
  experimental: {
    turbo: {
      rules: codeInspectorPlugin({
        bundler: "turbopack",
        editor: "code",
        dev: process.env.NODE_ENV !== "production",
      }),
    },
  },
}

// Make sure experimental mdx flag is enabled
const configWithMDX = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental,
    mdxRs: true,
  },
}

export default withBundleAnalyzer(withNextIntl(withMDX(configWithMDX)))
