/** @type {import('next').NextConfig} */

// GitHub Pages serves from a repo subpath, so prefix assets/links only in CI.
const isGhPages = process.env.GITHUB_PAGES === 'true';
const repo = 'hiroshimai-spiral';

const nextConfig = {
  // Fully static export → deployable to GitHub Pages (100% client-side WebGL).
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGhPages ? `/${repo}` : undefined,
  assetPrefix: isGhPages ? `/${repo}/` : undefined,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
};

export default nextConfig;
