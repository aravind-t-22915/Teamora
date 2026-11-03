// src/config/theme.ts
import { EventType, EventTypeConfig } from '../types';

export const colors = {
  background: {
    primary:   '#0F1117',
    secondary: '#161B22',
    tertiary:  '#1C2333',
    glass:     'rgba(255,255,255,0.05)',
  },
  accent: {
    primary: '#22C55E',
    light:   '#4ADE80',
    dark:    '#16A34A',
    glow:    'rgba(34,197,94,0.15)',
  },
  text: {
    primary:   '#F9FAFB',
    secondary: '#9CA3AF',
    muted:     '#6B7280',
    inverse:   '#0F1117',
  },
  status: {
    going:    '#22C55E',
    maybe:    '#EAB308',
    notGoing: '#EF4444',
    late:     '#F97316',
    pickup:   '#8B5CF6',
    noResp:   '#6B7280',
  },
  border:   'rgba(255,255,255,0.08)',
  divider:  'rgba(255,255,255,0.06)',
  overlay:  'rgba(0,0,0,0.6)',
  cardGlass:'rgba(22,27,34,0.8)',
} as const;

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 999,
} as const;

export const typography = {
  size: {
    xs: 11, sm: 13, md: 15, lg: 17, xl: 20,
    '2xl': 24, '3xl': 28, '4xl': 34, '5xl': 40,
  },
} as const;

export const glassCardStyle = {
  backgroundColor: 'rgba(22, 27, 34, 0.8)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: radius.lg,
  overflow: 'hidden' as const,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 8,
};

export const eventTypeConfig: Record<EventType, EventTypeConfig> = {
  practice:          { label: 'Practice',       color: '#3B82F6', icon: '⚽️', gradient: ['#1D4ED8', '#3B82F6'] },
  practice_match:    { label: 'Practice Match', color: '#60A5FA', icon: '⚽️', gradient: ['#2563EB', '#60A5FA'] },
  league_match:      { label: 'League Match',   color: '#22C55E', icon: '🏆', gradient: ['#15803D', '#22C55E'] },
  tournament_match:  { label: 'Tournament',     color: '#F97316', icon: '🥇', gradient: ['#C2410C', '#F97316'] },
  friendly_match:    { label: 'Friendly',       color: '#34D399', icon: '🤝', gradient: ['#059669', '#34D399'] },
  meeting:           { label: 'Meeting',        color: '#A855F7', icon: '📋', gradient: ['#7E22CE', '#A855F7'] },
  recovery_session:  { label: 'Recovery',       color: '#06B6D4', icon: '🧊', gradient: ['#0E7490', '#06B6D4'] },
  gym_session:       { label: 'Gym Session',    color: '#EF4444', icon: '💪', gradient: ['#B91C1C', '#EF4444'] },
  announcement:      { label: 'Announcement',   color: '#6B7280', icon: '📢', gradient: ['#374151', '#6B7280'] },
  payment_deadline:  { label: 'Payment',        color: '#EAB308', icon: '💰', gradient: ['#A16207', '#EAB308'] },
  birthday:          { label: 'Birthday',       color: '#EC4899', icon: '🎂', gradient: ['#BE185D', '#EC4899'] },
};
