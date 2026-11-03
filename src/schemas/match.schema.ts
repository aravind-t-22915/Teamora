// src/schemas/match.schema.ts
import { z } from 'zod';

// ─── Formation ────────────────────────────────────────────────────────────────
export const formationSchema = z.enum([
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '5-3-2',
  '4-1-4-1',
  '3-4-3',
]);

export type Formation = z.infer<typeof formationSchema>;

// ─── Timeline event type ──────────────────────────────────────────────────────
export const timelineEventTypeSchema = z.enum([
  'kickoff',
  'goal',
  'yellow_card',
  'red_card',
  'substitution',
  'half_time',
  'full_time',
]);

export type TimelineEventTypeValue = z.infer<typeof timelineEventTypeSchema>;

// ─── Timeline event ───────────────────────────────────────────────────────────
export const timelineEventSchema = z.object({
  id:              z.string(),
  minute:          z.number().int().min(0).max(120),
  type:            timelineEventTypeSchema,
  playerId:        z.string().nullable().optional(),
  playerName:      z.string().nullable().optional(),
  assistId:        z.string().nullable().optional(),
  assistName:      z.string().nullable().optional(),
  substituteInId:  z.string().nullable().optional(),
  substituteOutId: z.string().nullable().optional(),
  isOwnGoal:       z.boolean().default(false),
  isPenalty:       z.boolean().default(false),
  note:            z.string().default(''),
});

export type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;
