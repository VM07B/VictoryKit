/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["maula.ai", "fyzo.xyz"],
  },
};

module.exports = nextConfig;
