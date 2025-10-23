import bundleAnalyzer from "@next/bundle-analyzer";
import { createMDX } from "fumadocs-mdx/next";
import createNextIntlPlugin from "next-intl/plugin";
import { codeInspectorPlugin } from "code-inspector-plugin";

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
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
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1/copilotkit/:path*",
          destination: "https://validflow.airelief.cn/api/copilotkit/:path*",
        },
        {
          source: "/api/v1/:path*",
          destination: "https://validflow.airelief.cn/api/v1/:path*",
        },
      ];
    }
    return [];
  },
  async redirects() {
    return [];
  },
  experimental: {
    turbo: {
      rules: codeInspectorPlugin({
        bundler: "turbopack",
        editor: "cursor",
      }),
    },
  },
};

// Make sure experimental mdx flag is enabled
const configWithMDX = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental,
    mdxRs: true,
  },
};

export default withBundleAnalyzer(withNextIntl(withMDX(configWithMDX)));
