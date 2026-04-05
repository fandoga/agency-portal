import type { NextConfig } from "next";
import path from "node:path";

/**
 * Важно: `npm run build` должен быть с **webpack** (`next build --webpack`).
 * Дефолтный `next build` в Next 16 — Turbopack: он не использует блок `webpack` ниже,
 * из‑за чего на сервере часто оказываются **две копии react-redux** → разный
 * ReactReduxContext → `useReduxContext() === null` при prerender/SSR (типично на Vercel).
 *
 * `serverExternalPackages` — сервер не бандлит эти пакеты, один `require` из node_modules
 * (нельзя дублировать их же в `transpilePackages` — Next 16 выдаёт конфликт).
 */
const reactReduxRoot = path.resolve(process.cwd(), "node_modules/react-redux");
const rtkRoot = path.resolve(process.cwd(), "node_modules/@reduxjs/toolkit");

const nextConfig: NextConfig = {
  serverExternalPackages: ["react-redux", "@reduxjs/toolkit"],
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
      "react-redux": reactReduxRoot,
      "@reduxjs/toolkit": rtkRoot,
    };
    return config;
  },
};

export default nextConfig;
