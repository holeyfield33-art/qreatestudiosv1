import tailwindcss from "@tailwindcss/postcss";

const useFunctionPlugin = Boolean(process.env.VITEST) || Boolean(process.env.VITE);

const config = {
  plugins: useFunctionPlugin ? [tailwindcss] : ["@tailwindcss/postcss"],
};

export default config;
