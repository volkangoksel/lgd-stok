/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TypeScript hatalarını görmezden gel
  },
  eslint: {
    ignoreDuringBuilds: true, // Lint hatalarını görmezden gel
  },
};
export default nextConfig;