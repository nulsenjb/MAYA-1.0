import type { Config } from 'tailwindcss';
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#D4A090',
          deep: '#7A4030',
        },
        rose: {
          50:  '#FBF5F2',
          100: '#F5E5DE',
          200: '#EDD2C7',
          300: '#E1B9AB',
          400: '#D8A797',
          500: '#D4A090',
          600: '#C08673',
          700: '#9C6353',
          800: '#7A4030',
          900: '#58291D',
        },
        mauve: {
          300: '#C9A9B0',
          500: '#A87E8C',
          700: '#6E4F5C',
        },
      },
    },
  },
  plugins: []
};
export default config;
