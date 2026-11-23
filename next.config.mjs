// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//   },
// };

// export default nextConfig;
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2592000, // 30 days — RAWG images never change
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    styledComponents: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS for a year (Vercel serves HTTPS already)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Stop browsers guessing content types
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't let other sites embed us in an iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Send only the origin to other sites, never full URLs
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Features the site never uses
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
