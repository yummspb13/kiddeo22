// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      './src/**/*.{ts,tsx,mdx}',
      './app/**/*.{ts,tsx,mdx}',
      './pages/**/*.{ts,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          bg: 'rgb(var(--bg) / <alpha-value>)',
          fg: 'rgb(var(--fg) / <alpha-value>)',
          brand: 'rgb(var(--brand) / <alpha-value>)',
          surface: 'rgb(var(--surface) / <alpha-value>)',
          'surface-strong': 'rgb(var(--surface-strong) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          ok: 'rgb(var(--ok) / <alpha-value>)',
          warn: 'rgb(var(--warn) / <alpha-value>)',
          danger: 'rgb(var(--danger) / <alpha-value>)',
        },
        borderRadius: { '2xl': 'var(--radius)' },
        boxShadow: {
          sm: 'var(--shadow-sm)',
          md: 'var(--shadow-md)',
          lg: 'var(--shadow-lg)',
        },
        fontFamily: {
          inter: 'var(--font-inter), ui-sans-serif, system-ui',
          rubik: 'var(--font-rubik), ui-sans-serif, system-ui',
          unbounded: 'var(--font-unbounded), ui-sans-serif, system-ui',
        },
      },
    },
    plugins: [],
  }
