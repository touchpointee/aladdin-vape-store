/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '100mb',
        },
        proxyClientMaxBodySize: '100mb',
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    },
    images: {
        domains: ['minio-v0cs0k0c4o8kg00wowgkggso.72.61.238.188.sslip.io', 'placehold.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'minio-v0cs0k0c4o8kg00wowgkggso.72.61.238.188.sslip.io',
                port: '',
                pathname: '/**',
            }
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        minimumCacheTTL: 604800, // Cache for 1 week
        formats: ['image/webp', 'image/avif'],
    },
}

module.exports = nextConfig
