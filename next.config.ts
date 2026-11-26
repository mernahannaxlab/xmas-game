import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: 'dist',
  cacheComponents: true,
  partialPrefetching: true,
  // Parent folder has its own lockfile, so Turbopack was treating D:\projects
  // as the root and warning on every build. Pin the root to this app.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
