/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME || "localhost",
      },
    ],
  },
  // @node-rs/argon2 ships a native .node binary. Webpack can't parse binary
  // files, so it must be excluded from bundling (both the route handler and
  // Server Action compilers) and loaded via a plain runtime require instead.
  // This is required on Next.js <15 (the key moves to the stable top-level
  // `serverExternalPackages` in Next 15+).
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
};

export default nextConfig;
