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
        // --- SUAS CORES ORIGINAIS (Indigo + Zinc) ---
        primary: "#6366f1", // Indigo Vibrante
        'primary-hover': "#4f46e5",
        
        background: {
          light: "#f3f4f6",
          dark: "#0f0f11", // Fundo quase preto (Premium)
        },
        
        surface: {
          light: "#ffffff",  // Usado no modo claro
          dark: "#18181b",   // Cards no modo escuro
          highlight: "#27272a" // [NOVO] Um cinza levemente mais claro para inputs/hovers
        },
        
        text: {
          primary: "#f3f4f6", // Branco suave
          secondary: "#9ca3af", // Cinza textos
        },
        
        // Mantive o accent purple caso queira detalhes, mas o foco é Indigo
        accent: {
          purple: "#8b5cf6",
        }
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'], // Voltamos para sua fonte original
        display: ['Lexend', 'sans-serif'],
      }
    },
  },
  plugins: [],
}