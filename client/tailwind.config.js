/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
        waveHorizontal: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(50%)' },
        },
        waveBeach: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        FadeUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        FadeDown: {
          '0%': { transform: 'translateY(-50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        FadeLeft: {
          '0%': { transform: 'translateX(-50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        FadeRight: {
          '0%': { transform: 'translateX(50px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

      },
      },

      animation: {
        wave: 'wave 2s infinite ease-in-out',
        waveHorizontal: 'waveHorizontal 3s infinite linear',
        waveBeach: 'waveBeach 2s infinite ease-in-out',
        'fade-in-fast': 'fadeIn 0.5s ease-in-out',
        'fade-in-slow': 'fadeIn 1s ease-in-out',
        'fade-out-fast': 'fadeOut 0.5s ease-in-out',
        'fade-out-slow': 'fadeOut 1s ease-in-out',
        'fade-up-fast': 'FadeUp 0.5s ease-in-out',
        'fade-up-slow': 'FadeUp 1s ease-in-out',
        'fade-down-fast': 'FadeDown 0.5s ease-in-out',
        'fade-down-slow': 'FadeDown 1s ease-in-out',
        'fade-left-fast': 'FadeLeft 0.5s ease-in-out',
        'fade-left-slow': 'FadeLeft 1s ease-in-out',
        'fade-right-fast': 'FadeRight 0.5s ease-in-out',
        'fade-right-slow': 'FadeRight 1s ease-in-out',

      },
      screens: {
        sm: "340px",
        md: "540px",
        lg: "768px",
        xl: "1180px",

      },
      fontFamily: {
        Sour: ['Sour Gummy', 'cursive'],
        Poppins: ['Poppins', 'sans-serif'],
      },
    },

  plugins: [],
}