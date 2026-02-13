import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Titillium Web"', "system-ui", "sans-serif"],
      },
      colors: {
        dayhoff: {
          bg: {
            primary: "#10111a",
            secondary: "#1a1b23",
          },
          purple: "#8b5cf6",
          pink: "#ec4899",
          emerald: "#34d399",
          amber: "#fbbf24",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(to right, #8b5cf6, #ec4899)",
      },
    },
  },
  plugins: [],
};
export default config;
