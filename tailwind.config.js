/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores extraídas do design do Stitch
        primary: "#6366f1", // Indigo vibrante
        'primary-hover': "#4f46e5",
        background: {
          light: "#f3f4f6",
          dark: "#0f0f11", // O fundo "quase preto" do Stitch
        },
        surface: {
          light: "#ffffff",
          dark: "#18181b", // Cards e sidebar
        },
        text: {
          primary: "#f3f4f6", // Branco suave
          secondary: "#9ca3af", // Cinza para textos menores
        },
        accent: {
          purple: "#8b5cf6",
        }
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'], // Mantemos sua fonte original para identidade
      }
    },
  },
  plugins: [],
}