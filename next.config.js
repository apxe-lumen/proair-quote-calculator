/** @type {import('next').NextConfig} */
const nextConfig = {
  // On a self-hosted Plesk box there's no CDN cache-busting like Vercel
  // provides, so ensure browsers always revalidate JS chunks.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path((?!_next/static).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
