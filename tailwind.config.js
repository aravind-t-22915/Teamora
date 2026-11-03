/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background:       '#0F1117',
        surface:          '#161B22',
        elevated:         '#1C2333',
        accent:           '#22C55E',
        'accent-light':   '#4ADE80',
        'accent-dark':    '#16A34A',
        'text-primary':   '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-muted':     '#6B7280',
        // event type colours
        'event-practice':    '#3B82F6',
        'event-match':       '#22C55E',
        'event-tournament':  '#F97316',
        'event-meeting':     '#A855F7',
        'event-gym':         '#EF4444',
        'event-recovery':    '#06B6D4',
        'event-payment':     '#EAB308',
        'event-birthday':    '#EC4899',
        'event-announce':    '#6B7280',
        // status
        'status-going':    '#22C55E',
        'status-maybe':    '#EAB308',
        'status-no':       '#EF4444',
        'status-late':     '#F97316',
        'status-pickup':   '#8B5CF6',
      },
      fontFamily: {
        sans:     ['Inter_400Regular'],
        medium:   ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold:     ['Inter_700Bold'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg:      '16px',
        xl:      '20px',
        '2xl':   '24px',
      },
    },
  },
  plugins: [],
};
