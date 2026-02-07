import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  ...coreWebVitals,
  {
    rules: {
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Allow any in pragmatic cases
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
