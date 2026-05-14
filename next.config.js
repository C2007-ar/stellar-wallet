/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Empêche le clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Empêche le MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Force HTTPS en production
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Contrôle les infos de referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Désactive les fonctionnalités dangereuses du navigateur
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Protection XSS basique
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;