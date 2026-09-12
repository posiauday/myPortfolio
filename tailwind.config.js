/** @type {import('tailwindcss').Config} */
export default {
  // The app toggles a `dark` class on its own <main>, not on <html>, so the
  // class strategy (not media) is required for the dark: variants to resolve.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#168326", ink: "#17201B", tint: "#E7F6EA" }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};
