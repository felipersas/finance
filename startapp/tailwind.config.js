/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        tint: "#b4da4aff",
        onyx: "#181A1B",
        onyxLight: "#23272a",

        // Semantic colors
        error: "#B3261E",
        success: "#b4da4aff",

        // Light mode
        light: {
          card: "#fff",
          text: "#181A1B",
          background: "#f7f8fa",
          icon: "#b4da4aff",
          tabIconDefault: "#d1d5db",
          tabIconSelected: "#b4da4aff",
          muted: "#e5e7eb",
        },

        // Dark mode
        dark: {
          card: "#23272a",
          text: "#fff",
          background: "#181A1B",
          icon: "#b4da4aff",
          tabIconDefault: "#23272a",
          tabIconSelected: "#b4da4aff",
          muted: "#23272a",
        },
      },
    },
  },
  plugins: [],
};
