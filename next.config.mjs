/** @type {import('next').NextConfig} */
const isDev = globalThis.process?.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com"
  : "'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com";

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://accounts.google.com https://*.googleapis.com; frame-src https://accounts.google.com; font-src 'self' data:; base-uri 'self'; form-action 'self' https://accounts.google.com; frame-ancestors 'none'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
