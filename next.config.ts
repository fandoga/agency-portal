import type { NextConfig } from "next";
import path from "node:path";

/**
 * Используйте `next dev --webpack` и `next build --webpack` (см. package.json).
 * Иначе Turbopack не применяет `webpack.resolve.alias` → возможны две копии react-redux.
 *
 * Не включайте `serverExternalPackages` для react-redux: в dev/webpack SSR внешний
 * пакет тянет другой экземпляр React → Invalid hook call / useMemo на null.
 */
const reactReduxRoot = path.resolve(process.cwd(), "node_modules/react-redux");
const rtkRoot = path.resolve(process.cwd(), "node_modules/@reduxjs/toolkit");

const nextConfig: NextConfig = {
  transpilePackages: ["react-redux", "@reduxjs/toolkit"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
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
