/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'nyukdheirsaftknfpcxo.supabase.co', // Your Supabase storage domain
      'lh3.googleusercontent.com', // Google profile image domain
    ],
  },
};

export default nextConfig;
