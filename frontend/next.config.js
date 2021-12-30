/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: "http://localhost:8000/api/:slug*/", // Proxy to Backend
      },
      // XXX: handle .json,.yaml,.yml,.ics
      // {
      //   source: ":slug.json",
      //   destination: "http://localhost:8000/api/:slug*/", // Proxy to Backend
      // },
      {
        source: "/avatar/:slug*",
        destination: "https://www.gravatar.com/avatar/:slug*",
      },
    ]
  },
}
