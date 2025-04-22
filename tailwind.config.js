/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './src/style.css'],
  safelist: ['text-primary', 'hover:text-primary-hover'],
  theme: {
    extend: {
      colors: {
        blue: {
          600: '#1FA0F0',
          500: '#3FCFFF',
        },
        primary: '#1FA0F0', // Updated to desired 1FA0F0
        'primary-hover': '#3FCFFF', // Lighter highlight matching primary
        secondary: '#334155', // slate-700 (new dark grey)
        accent: '#6366f1', // indigo-500 (new accent)
        background: '#0f172a', // slate-900 (new dark background)
      },
    },
  },
  plugins: [],
}
