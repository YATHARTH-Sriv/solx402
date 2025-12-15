// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     remotePatterns: [
//       {
//         hostname: "lcwirfgestriplhymkvv.supabase.co"
//       },
//       {
//         hostname: "*.public.blob.vercel-storage.com"
//       },
//       {
//         hostname: "*.blob.vercel-storage.com"
//       }
//     ],
//   },
//   env: {
//     NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'solana-devnet',
//     NEXT_PUBLIC_RECEIVER_ADDRESS: process.env.NEXT_PUBLIC_RECEIVER_ADDRESS,
//     NEXT_PUBLIC_FACILITATOR_URL: process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator',
//     NEXT_PUBLIC_CDP_CLIENT_KEY: process.env.NEXT_PUBLIC_CDP_CLIENT_KEY,
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lcwirfgestriplhymkvv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

