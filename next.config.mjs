import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
      "img.clerk.com",
    ],
  },
  experimental: {
    serverActions: true,
    serverMinification: true,
    swcMinify: true,
  },
};

export default config;
