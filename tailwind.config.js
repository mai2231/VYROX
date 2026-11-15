/** VYROX Tailwind configuration — design tokens from the brand sheet. */
export default {
  content: ['./*.html', './admin/*.html', './src/**/*.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        red: '#E31B32',
        'red-bright': '#F0354B',
        charcoal: '#1C1C1F',
        muted: '#A1A1AA',
        soft: '#F5F5F5',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        body: 'rgb(var(--body) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)'
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      letterSpacing: {
        brand: '0.28em',
        wide2: '0.18em'
      },
      maxWidth: {
        site: '1440px'
      },
      boxShadow: {
        lift: '0 24px 60px -30px rgba(17,17,17,0.35)',
        panel: '0 30px 80px -40px rgba(17,17,17,0.5)',
        redglow: '0 0 0 1px rgba(227,27,50,0.35), 0 20px 50px -25px rgba(227,27,50,0.55)'
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      screens: {
        xs: '420px'
      }
    }
  },
  plugins: []
};
