import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Снижает риск дублей react-redux в RSC-сборке (контекст store = null на SSR/edge).
  serverExternalPackages: ["react-redux", "@reduxjs/toolkit"],
};

export default nextConfig;
