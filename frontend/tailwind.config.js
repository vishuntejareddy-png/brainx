/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme")

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'flux-background': '#080808',
        'flux-card': '#111111',
        'flux-accent': '#2DD4BF', // Teal accent
        'flux-border': '#1a1a1a', // Border color used in the existing code
        'flux-light-border': '#222222', // Lighter border for user pill
        'flux-neutral-50': '#FAFAFA', // Replicating neutral-50
        'flux-neutral-300': '#D4D4D4', // Replicating neutral-300
        'flux-neutral-400': '#A3A3A3', // Replicating neutral-400
        'flux-neutral-500': '#737373', // Replicating neutral-500
        'flux-neutral-600': '#525252', // Replicating neutral-600
        'flux-neutral-700': '#404040', // Replicating neutral-700
        'flux-neutral-800': '#262626', // Replicating neutral-800
        'flux-amber-500': '#F59E0B', // Replicating amber-500
        'flux-amber-900': '#78350F', // Replicating amber-900
      },
      spacing: {
        '4': '16px', // 4dp * 4 = 16px (assuming 1dp = 4px for Tailwind's default unit)
        '8': '32px', // 8dp * 4 = 32px
        '12': '48px', // 12dp * 4 = 48px
        '16': '64px', // 16dp * 4 = 64px
        '24': '96px', // 24dp * 4 = 96px
        '32': '128px', // 32dp * 4 = 128px
        '48': '192px', // 48dp * 4 = 192px
        '1': '4px', // For 1dp unit
        '2': '8px', // For 2dp unit
        '3': '12px', // For 3dp unit
        '5': '20px', // For 5dp unit
        '6': '24px', // For 6dp unit
        '7': '28px', // For 7dp unit
        '9': '36px', // For 9dp unit
        '10': '40px', // For 10dp unit
      },
      borderRadius: {
        'sm': '8px', // small=8dp
        'md': '12px', // medium=12dp
        'lg': '16px', // large=16dp
        'xl': '20px', // Adjusted to follow 4dp rule from 12px
        '2xl': '24px', // Adjusted to follow 4dp rule from 16px
        '3xl': '28px', // Adjusted to follow 4dp rule from 24px
        'full': '9999px', // pill=100dp, will use full for this
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1', fontWeight: '700' }],
        'title': ['20px', { lineHeight: '1', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1', fontWeight: '400' }],
        'xs': ['12px', { lineHeight: '1' }], // Replicating existing xs
        'sm': ['14px', { lineHeight: '1.25' }], // Replicating existing sm
        'base': ['16px', { lineHeight: '1.5' }], // Replicating existing base
        'lg': ['18px', { lineHeight: '1.75' }], // Replicating existing lg
        'xl': ['20px', { lineHeight: '1.75' }], // Replicating existing xl
        '2xl': ['24px', { lineHeight: '2' }], // Replicating existing 2xl
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
