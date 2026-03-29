import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Silence monorepo/workspace turbopack root warning when running from frontend/ */
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
