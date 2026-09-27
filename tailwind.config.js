/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kito: {
          bg: '#0A0A0A',
          dark: '#111111',
          surface: '#151515',
          card: '#181818',
          cardHover: '#1f1f1f',
          accent: '#C8FF00',
          accentHover: '#b5e600',
          accentGlow: 'rgba(200, 255, 0, 0.25)',
          muted: '#A0A0A0',
          border: 'rgba(255, 255, 255, 0.08)',
          borderActive: 'rgba(200, 255, 0, 0.4)'
        }
      },
      fontFamily: {
        impact: ['Anton', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 25px rgba(200, 255, 0, 0.25)',
        'glow-accent-lg': '0 0 45px rgba(200, 255, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
