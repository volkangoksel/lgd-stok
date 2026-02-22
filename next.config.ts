/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint kısmını buradan sildik çünkü Next 16+ sürümlerinde bu şekilde kullanılmıyor.
};

export default nextConfig;