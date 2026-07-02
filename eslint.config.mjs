import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  ...nextConfig,
];

export default config;
