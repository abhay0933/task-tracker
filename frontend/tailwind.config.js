/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(99,102,241,0.1) 0%, transparent 50%)',
        'gradient-mesh-dark': 'radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(99,102,241,0.15) 0%, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
