import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
} satisfies Config;
