// src/schemas/event.schema.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  type: z.enum([
    'practice', 'practice_match', 'league_match', 'tournament_match',
    'friendly_match', 'meeting', 'recovery_session', 'gym_session',
    'announcement', 'payment_deadline', 'birthday',
  ]),
  title:               z.string().min(1, 'Title is required').max(100),
  description:         z.string().max(1000).optional().default(''),
  date:                z.date(),
  startTime:           z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  endTime:             z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM').optional().default(''),
  allDay:              z.boolean().default(false),
  venueName:           z.string().max(200).optional().default(''),
  venueAddress:        z.string().max(300).optional().default(''),
  isMatch:             z.boolean().default(false),
  opponent:            z.string().max(100).optional(),
  competition:         z.string().max(100).optional(),
  isHomeGame:          z.boolean().optional(),
  targetGroups:        z.array(z.string()).default([]),
  visibleToAll:        z.boolean().default(true),
  coachNotes:          z.string().max(2000).optional().default(''),
  weatherPlaceholder:  z.string().max(100).optional().default(''),
  notificationsEnabled:z.boolean().default(true),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
