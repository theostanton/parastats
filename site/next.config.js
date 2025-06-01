/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        externalDir: true,
    },
    compiler: {
        styledComponents: true,
    },
};

module.exports = nextConfig;
