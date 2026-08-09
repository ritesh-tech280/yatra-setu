import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.22.147.63"],
  // `tsc --noEmit` runs in the build script. This avoids Next spawning a
  // second type-check worker, which Windows can deny with `spawn EPERM`.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Avoid multi-process page-data workers in restricted Windows environments.
    cpus: 1,
    workerThreads: true,
  },
};

export default nextConfig;
