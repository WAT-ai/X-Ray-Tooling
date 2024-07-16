/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    './src/Pages/**/*.{html,js}',
    './src/Components/**/*.{html,js}'
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-linear': 'linear-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      }),
      backgroundClip: {
        text: 'text',
      },
      colors: {
        'dark-blue': '#002D62',
        'theme-blue': '#2C71D9',
        'theme-blue-hover': '#205ab2',
        'theme-blue-light': 'rgb(44, 113, 217)',
        'theme-blue-dark': '#25559D',
        'response-grey': '#EEEEEE',
        'dark-grey': '#AAAAAA',
        'progress-green': 'rgb(75, 181, 67)',
        'hover-green': '#3c9035',
      },
      animation: {
        'slide-in': 'slide-in 0.5s forwards',
        'typing': "typing 3s steps(25) infinite alternate, blink .9s infinite"
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'blink': {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "white"
          }
        },
        'typing': {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }
        }
      },
    },
  },
  variants: {
    extend: {
      backgroundImage: ['hover', 'focus'],
      backgroundClip: ['hover', 'focus'],
    },
  },
  plugins: [],
}

