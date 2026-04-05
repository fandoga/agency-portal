import type { NextConfig } from "next";
import path from "node:path";

/**
 * Жёстко одна копия react-redux / RTK в webpack-сборке (Vercel / Linux).
 * В turbopack используем относительные пути — абсолютные Windows-пути ломают локальный Turbopack.
 */
const reactReduxWebpack = path.resolve(process.cwd(), "node_modules/react-redux");
const rtkWebpack = path.resolve(process.cwd(), "node_modules/@reduxjs/toolkit");

const nextConfig: NextConfig = {
  transpilePackages: ["react-redux", "@reduxjs/toolkit"],
  turbopack: {
    resolveAlias: {
      "react-redux": "./node_modules/react-redux",
      "@reduxjs/toolkit": "./node_modules/@reduxjs/toolkit",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-redux": reactReduxWebpack,
      "@reduxjs/toolkit": rtkWebpack,
    };
    return config;
  },
};

export default nextConfig;
