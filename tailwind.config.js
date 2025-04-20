/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600 (kept)
        secondary: '#334155', // slate-700 (new dark grey)
        accent: '#6366f1', // indigo-500 (new accent)
        background: '#0f172a', // slate-900 (new dark background)
        'text-primary': '#f1f5f9', // slate-100 (new light text)
        'text-secondary': '#94a3b8', // slate-400 (new dimmer text)
      },
    },
  },
  plugins: [],
}
