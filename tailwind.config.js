/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:           '#8a3800',
        'primary-container': '#af4b06',
        secondary:         '#77574d',
        surface:           '#fff8ef',
        'surface-low':     '#fbf3e4',
        'surface-high':    '#e9e2d3',
        'on-surface':      '#1e1b13',
        'on-primary':      '#ffffff',
        outline:           '#8a7267',
      },
      fontFamily: {
        display: ['"Noto Serif"', 'Georgia', 'serif'],
        body:    ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
