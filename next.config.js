/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 2GB 파일 업로드 허용
    bodyParserSizeLimit: '2gb',
  },
};

module.exports = nextConfig;
