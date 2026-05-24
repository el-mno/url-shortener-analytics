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
};

export default nextConfig;
