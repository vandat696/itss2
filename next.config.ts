import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "7mb" } },
  poweredByHeader: false,
};
export default config;
