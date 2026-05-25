import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for slim container images.
  output: "standalone",
  // Linting runs as its own step (`npm run lint`) and in CI, so the build does
  // not need to re-run it.
  eslint: { ignoreDuringBuilds: true },
  // geoip-lite reads binary data files from disk at runtime, so it must stay
  // external to the server bundle instead of being traced/inlined by the compiler.
  serverExternalPackages: ["geoip-lite"],
  // Keep the ~160 MB GeoIP dataset out of serverless function bundles (e.g. on
  // Vercel, where the x-vercel-ip-country header is used instead). Self-hosted
  // and Docker deployments still ship the dataset and resolve locally.
  outputFileTracingExcludes: {
    "*": ["node_modules/geoip-lite/data/**"],
  },
};

export default nextConfig;
