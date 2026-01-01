/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["maula.ai", "maula.ai"],
  },
};

module.exports = nextConfig;
