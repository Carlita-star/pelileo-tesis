/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Desactivamos el reset global para no afectar el panel admin.
  corePlugins: { preflight: false },

  theme: {
    extend: {
      colors: {
        primario:           'var(--color-primario, #1D9E75)',
        'primario-oscuro':  'var(--color-primario-oscuro, #157A5A)',
        secundario:         'var(--color-secundario, #F9A825)',
        terciario:          'var(--color-terciario, #2563EB)',
      },
      borderRadius: {
        portal: 'var(--borde-radio, 10px)',
      },
      fontFamily: {
        sans: ['var(--font-portal, "Manrope")', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
};