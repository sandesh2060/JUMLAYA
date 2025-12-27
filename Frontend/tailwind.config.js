// Frontend/tailwind.config.js - FIXED VERSION
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // ⭐ FIXED: Changed from ["class", "class"] to "class"
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f1f8f4',
          '100': '#dcefe3',
          '200': '#b8dfc7',
          '300': '#8fcca6',
          '400': '#5eb87e',
          '500': '#2f9f5f',
          '600': '#23804b',
          '700': '#1c663d',
          '800': '#174f31',
          '900': '#123d26',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          '50': '#faf7f2',
          '100': '#f0e7d8',
          '200': '#e0ceb2',
          '300': '#cbb184',
          '400': '#b2945e',
          '500': '#9a7a42',
          '600': '#7b6034',
          '700': '#5f4a2a',
          '800': '#493a22',
          '900': '#372c1b',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        accent: {
          '50': '#f6fbf4',
          '100': '#e6f5e1',
          '200': '#cceac3',
          '300': '#a8db9a',
          '400': '#7cc96a',
          '500': '#55b84a',
          '600': '#3f9336',
          '700': '#31752c',
          '800': '#275c25',
          '900': '#1f481f',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        neutral: {
          '50': '#ffffff',
          '100': '#f8f9f7',
          '200': '#f1f2ef',
          '300': '#dcded9',
          '400': '#b9bdb4',
          '500': '#8f948a',
          '600': '#6f736c',
          '700': '#565a54',
          '800': '#3f423e',
          '900': '#2a2c29'
        },
        success: '#2f9f5f',
        warning: '#e6a23c',
        error: '#d9534f',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      backgroundColor: {
        'app': '#f8f9f7',
        'card': '#ffffff',
        'dark': '#1f2d23',
        'dark-secondary': '#26382b'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0,0,0,0.15)',
        card: '0 8px 20px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};