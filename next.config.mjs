/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["api.qrserver.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp", "canvas"],
  },
};

export default nextConfig;
