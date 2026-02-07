import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['PT Sans', 'sans-serif'],
        headline: ['Outfit', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        code: ['Source Code Pro', 'monospace'],
        display: ['Playfair Display', 'serif'],
      },
      transitionTimingFunction: {
        quint: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'background-light': '#FDFBF7',
        'background-dark': '#1F1A16',
        'surface-light': '#FFFFFF',
        'surface-subtle': '#F6F1EB',
        'surface-dark': '#2A2420',
        'text-main-light': '#2D241E',
        'text-main-dark': '#EAE0D5',
        'text-secondary-light': '#6B5D52',
        'text-secondary-dark': '#D4C5BB', /* Lightened for better dark mode visibility */
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark: '#A0420B',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      spacing: {
        'gr-1': '10px',
        'gr-2': '16px',
        'gr-3': '26px',
        'gr-4': '42px',
        'gr-5': '68px',
        'gr-6': '110px',
        'gr-7': '178px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.618rem',
      },
      backgroundImage: {
        'hero-pattern': "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5X5SY0V3iM9SIwYUSEXGPuaEQfXWrgvGSHbGB-S8LZRiy12oBAoSb3FbROBJqRqHCNaQMxpvoVO-mu3trcTOIqTeSs_gY_KDRnzS4uZHeo4-L0NhcFy2Ut1N7NCobt1oc5f9CG8v-Zb7lyDNQRYjfoxZDNPTbOC6NR55Fj42lPIjDvyA_HDyf3p_qxk0R-5kL55DFBybNyqapn_kr44shNuyTXSiOjpVbE1sLfbed49jlwV9Wr_WzxxVxmoHUehAoZElAMWz2vyy0')",
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;