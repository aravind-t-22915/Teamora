// src/config/constants.ts

export const APP_NAME     = 'Teamora';
export const CLUB_NAME    = 'FC Revelation';
export const SEASON       = '2025-2026';

/** Firestore collection names */
export const COLLECTIONS = {
  CLUBS:         'clubs',
  USERS:         'users',
  GROUPS:        'groups',
  EVENTS:        'events',
  ATTENDANCE:    'attendance',
  COMMENTS:      'comments',
  REPORTS:       'reports',
  PLAYER_STATS:  'playerStats',
  MATCH_DATA:    'matchData',
  MATCH_RESULTS: 'matchResults',
  GALLERY:       'gallery',
  NOTIFICATIONS: 'notifications',
  CLUB_SETTINGS: 'clubSettings',
} as const;

export const PAGINATION = {
  EVENTS_PER_PAGE:   20,
  PLAYERS_PER_PAGE:  30,
  COMMENTS_PER_PAGE: 20,
  GALLERY_PER_PAGE:  24,
} as const;

export const IMAGE = {
  MAX_WIDTH:       1200,
  MAX_HEIGHT:      1200,
  COMPRESS_QUALITY: 0.75,
  THUMB_SIZE:      400,
} as const;

export const INVITE_CODE_LENGTH = 6;
