/** @type {import('next').NextConfig} */
const removeImports = require("next-remove-imports")();

module.exports = removeImports({
  reactStrictMode: false,
  experimental: { esmExternals: "loose", appDir: true },
});
