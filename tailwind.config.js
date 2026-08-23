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
          DEFAULT: '#16804A',
          dark: '#0D5C36',
          light: '#E8F5EE',
        },
        cream: {
          DEFAULT: '#FFF9F0',
          dark: '#F5EDE0',
        },
        golden: {
          DEFAULT: '#F4B942',
          light: '#FEF3D9',
        },
        pepper: {
          DEFAULT: '#E85D3F',
          light: '#FDE8E3',
        },
        dark: {
          DEFAULT: '#1C1C1C',
          soft: '#2D2D2D',
        },
        muted: {
          DEFAULT: '#737373',
          light: '#A3A3A3',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'nav': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
}