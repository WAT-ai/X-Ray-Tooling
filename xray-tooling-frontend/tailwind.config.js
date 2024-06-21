/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}", 
    './src/Pages/**/*.{html,js}',
    './src/Components/**/*.{html,js}'
  ],
  theme: {
    extend: {
      animation: {
        'slide-in': 'slide-in 0.5s forwards',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

