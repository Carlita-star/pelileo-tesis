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
        secundario:         'var(--color-secundario, #F59E0B)',
      },
      fontFamily: {
        sans: ['var(--font-portal, "Inter")', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
};