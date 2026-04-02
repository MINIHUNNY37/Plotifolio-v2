/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#070b11',
        midnight: '#0d1724',
        navy: '#112235',
        deepsea: '#143545',
        brass: '#c7a86a',
        copper: '#9f7a42',
        ember: '#cb6f5b',
        verdigris: '#4f9d96',
        cyan: '#78bfd0',
        parchment: '#ebe4d2',
        frost: '#d7dde4',
        pine: '#7e9784',
      },
      fontFamily: {
        display: ['Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
        body: ['Segoe UI Variable Text', 'Aptos', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 18px 45px rgba(0, 0, 0, 0.36)',
        brass: '0 0 0 1px rgba(199, 168, 106, 0.45), inset 0 1px 0 rgba(255, 234, 196, 0.12)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'bronze-grid':
          'linear-gradient(rgba(199,168,106,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(199,168,106,0.08) 1px, transparent 1px)',
        'panel-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 22%, rgba(0,0,0,0.16) 100%)',
      },
      keyframes: {
        'soft-pulse': {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
        'panel-rise': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'soft-pulse': 'soft-pulse 2.8s ease-in-out infinite',
        'panel-rise': 'panel-rise 220ms ease-out',
      },
    },
  },
  plugins: [],
};
