/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Distinct from generic Tailwind blue/indigo defaults per
        // frontend-design guidance -- pick something with enough contrast
        // to also work as the "high contrast" accessibility profile base.
        brand: {
          50: '#f2f7f5',
          100: '#dcece5',
          400: '#3f8f74',
          500: '#2f7a61',
          600: '#22624c',
          700: '#1c4e3d',
        },
      },
    },
  },
  plugins: [],
}
