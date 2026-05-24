import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for slim container images.
  output: "standalone",
  // geoip-lite reads binary data files from disk at runtime, so it must stay
  // external to the server bundle instead of being traced/inlined by the compiler.
  serverExternalPackages: ["geoip-lite"],
};

export default nextConfig;
