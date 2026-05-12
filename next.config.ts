import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api-vps/:path*',
                destination: 'http://76.13.231.158:3000/api/:path*',
            },
        ];
    },
};

export default nextConfig;