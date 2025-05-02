/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};
// next.config.js

// intercept shutdown signals early
process.on("SIGINT", () => {
  console.log("Received SIGINT, exiting gracefully…");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, exiting gracefully…");
  process.exit(0);
});

module.exports = {
  // ...the rest of your Next.js config
};

module.exports = nextConfig;
