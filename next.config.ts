import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep crawler/validator metadata in the initial <head> for Vinext.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
