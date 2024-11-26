/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pzeondiuoiuoqhkwlowr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/workspace-logos/**',
            },
            {
                protocol: 'https',
                hostname: 'pzeondiuoiuoqhkwlowr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/avatars/**',
            },
            {
                protocol: 'https',
                hostname: 'pzeondiuoiuoqhkwlowr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/file-banners/**',
            },
            {
                protocol: 'https',
                hostname: 'pzeondiuoiuoqhkwlowr.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/uploads/**',
            }
        ],
    },
};

export default nextConfig;
