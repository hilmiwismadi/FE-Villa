/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#e8e4dc',
          300: '#d4cdc0',
          400: '#b8ad9a',
          500: '#9d8f79',
          600: '#87786a',
          700: '#6f6259',
          800: '#5c524c',
          900: '#4c453f',
        },
        gold: {
          50: '#fdfbf7',
          100: '#fbf6ec',
          200: '#f5e8cf',
          300: '#edd7b0',
          400: '#e2bb81',
          500: '#d4a15a',
          600: '#c08644',
          700: '#a06a38',
          800: '#825532',
          900: '#6b462b',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
