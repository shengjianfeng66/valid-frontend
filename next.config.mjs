import bundleAnalyzer from "@next/bundle-analyzer"
import { createMDX } from "fumadocs-mdx/next"
import createNextIntlPlugin from "next-intl/plugin"
import { codeInspectorPlugin } from "code-inspector-plugin"

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
    const defaultOrigin = "https://validflow.airelief.cn"
    const devOrigin = {
      local: "http://127.0.0.1:8000",
      development: "https://validflow.airelief.cn",
    }

    const origin = devOrigin[process.env.NODE_ENV] || defaultOrigin

    if (process.env.NODE_ENV === "production") {
      return []
    } else {
      return [
        {
          source: "/api/copilotkit/:path*",
          destination: "https://validflow.airelief.cn/api/copilotkit/:path*",
        },
        {
          source: "/api/v1/:path*",
          destination: `${origin}/api/v1/:path*`,
        },
      ];
    } else if (process.env.NODE_ENV === "test") {
      return [
        {
          source: "/api/v1/:path*",
          destination: "http://127.0.0.1:8000/api/v1/:path*",
        }
      ];
    }
  },
  async redirects() {
    return []
  },
  experimental: {
    turbo: {
      rules: codeInspectorPlugin({
        bundler: "turbopack",
        editor: "cursor",
        dev: process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development",
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
