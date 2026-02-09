/** @type {import('next').NextConfig} */
const nextConfig = {
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
