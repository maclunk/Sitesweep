/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // soft petrol/teal
          dark: '#0D5D56',
          light: '#14B8A6',
        },
        accent: {
          blue: '#7DD3FC', // light sky-blue
          peach: '#FED7AA', // warm peach/beige
          lime: '#D9F99D', // subtle lime
        },
        bg: {
          soft: '#F8FAFC',
        },
        text: {
          DEFAULT: '#0F172A', // slate-900
          muted: '#475569', // slate-600
        },
        // Alias for text-muted to avoid conflicts
        'text-muted': '#475569',
      },
      borderRadius: {
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #E0F2FE 0%, #FED7AA 50%, #F0FDF4 100%)',
        'gradient-cta': 'linear-gradient(135deg, #7DD3FC 0%, #FED7AA 100%)',
        'gradient-footer': 'linear-gradient(135deg, #E0F2FE 0%, #FED7AA 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

