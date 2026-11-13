/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          page: "var(--bg-page)",
          deep: "var(--bg-deep)",
          surface: "var(--bg-surface)",
          raised: "var(--bg-raised)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        cobalt: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
          soft: "var(--accent-soft)",
        },
        hairline: {
          DEFAULT: "var(--border-hairline)",
          strong: "var(--border-strong)",
        },
        btn: {
          primary: "var(--btn-primary-bg)",
          "primary-fg": "var(--btn-primary-fg)",
        },
        positive: "var(--positive)",
        negative: "var(--negative)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        unslop: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
