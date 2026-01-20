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
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-accent': 'var(--text-accent)',
        'button-accent': 'var(--button-accent)',
        'text-on-primary': 'var(--text-on-primary)',
        'border-color': 'var(--border-color)',

        // Backward compatibility (mapping old names to new vars appropriately)
        primary: 'var(--button-accent)',
        'background-dark': 'var(--bg-primary)',
        'surface-dark': 'var(--bg-secondary)',
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}