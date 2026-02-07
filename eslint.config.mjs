import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const eslintConfig = [
  ...nextConfig,
  ...coreWebVitals,
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Allow unused vars/args/destructured with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      // Allow any in pragmatic cases
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
