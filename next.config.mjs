/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["molstar"],
  webpack: (config, { isServer }) => {
    // WASM support for molstar
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Node polyfill fallbacks (molstar references fs/path but doesn't need them in browser)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
