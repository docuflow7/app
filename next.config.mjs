/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export: the app is 100% client-side (no API routes,
  // no server actions), so it can be hosted on any free static host
  // (Netlify, Cloudflare Pages, GitHub Pages) with no visitor login.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // GitHub project pages serve the site under a subpath (/app).
  // Set PAGES_BASE_PATH=/app only for that deploy; all other hosts use root.
  basePath: process.env.PAGES_BASE_PATH || "",
  // NOTE: Next.js `headers()` is not supported with `output: "export"`.
  // Equivalent security headers ship via `public/_headers`
  // (honored by Netlify and Cloudflare Pages).
};

export default nextConfig;
