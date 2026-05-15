import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is enabled by default in development.
  // The CHOKIDAR_USEPOLLING environment variable in docker-compose
  // handles file watching polling if needed.
};

export default nextConfig;
